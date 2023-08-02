import { S3, config } from "aws-sdk";
import { readFileSync, statSync, unlinkSync } from "fs";
import { userSubscriptionStatus } from "../../lib/enums.js";
import {
  addImageQuery,
  editImageQuery,
  getImageQuery,
  removeImageQuery,
} from "../queries/images";
import { getProjectQuery, editProjectQuery } from "../queries/projects";
import { Request, Response, NextFunction } from "express";
import { getMetadata, resizeImage } from "../../lib/imageProcessing.js";
import { splitAtIndex } from "../../lib/utils.js";
import { editUserQuery, getUserByIdQuery } from "../queries/users.js";
import { getTableViewQuery } from "../queries/tableViews.js";
import { getProjectUserByUserAndProjectQuery } from "../queries/projectUsers.js";

config.update({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const s3 = new S3();

interface GetSignedUrlRequestObject {
  body: {
    image_id: string | number;
    folder_name: string;
    bucket_name: string;
  };
}

async function getSignedUrlForDownload(
  req: GetSignedUrlRequestObject,
  res: Response,
  next: NextFunction
) {
  try {
    const imageData = await getImageQuery(req.body.image_id);
    const objectName = imageData.rows[0].file_name;
    const params = {
      Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
      Key: objectName,
      Expires: 60 * 60 * 24 * 3,
    };
    // if(req.body.download_name) params.ResponseContentDisposition = `filename="${req.body.download_name}"`
    const url = await new Promise((resolve, reject) => {
      s3.getSignedUrl("getObject", params, (err, url) => {
        err ? reject(err) : resolve(url);
      });
    });
    res.send({ url });
  } catch (err) {
    next(err);
  }
}

// async function getSignedUrlForUpload(req: Request, res: Response, next: NextFunction) {
//   function splitAtIndex(value, index) {
//     return [value.substring(0, index), value.substring(index)];
//   }

//   const name = req.body.name;
//   const uuid = uuidv4();
//   var ind2 = name.lastIndexOf(".");
//   const type = splitAtIndex(name, ind2);
//   const imageRef = uuid + type[1];

//   const params = {
//     Bucket: req.body.bucket_name,
//     Fields: {
//       key: `${req.body.folder_name}/${imageRef}`,
//     },
//     Expires: 60 * 10,
//   };

//   try {
//     const url = await new Promise((resolve, reject) => {
//       s3.createPresignedPost(params, (err, url) => {
//         err ? reject(err) : resolve(url);
//       });
//     });
//     res.send({ url, imageRef });
//   } catch (err) {
//     next(err);
//   }
// }

interface NewImageForProjectRequestObject extends Request {
  body: {
    bucket_name: string;
    folder_name: string;
    project_id: number;
    current_file_id?: number;
    make_image_small: boolean;
  };
}

function computeAwsImageParamsFromRequest(req: Request, filePath: string) {
  if (!req.file) throw new Error("Missing file");
  const name = req.file.originalname;
  var ind2 = name.lastIndexOf(".");
  const type = splitAtIndex(name, ind2);
  const imageRef = req.file.filename + type[1];

  return {
    Bucket: `${req.body.bucket_name}/${req.body.folder_name}`,
    Key: imageRef,
    Body: readFileSync(filePath),
  };
}

async function checkUserProLimitReachedAndAuth(
  sessionUser: string | number | undefined
) {
  if (!sessionUser) throw new Error("User is not logged in");
  const userData = await getUserByIdQuery(sessionUser);
  const user = userData.rows[0];
  const userDataCount = user.used_data_in_bytes;
  const ONE_HUNDRED_MEGABYTES_IN_BYTES = 104857600;
  if (userDataCount >= ONE_HUNDRED_MEGABYTES_IN_BYTES) {
    if (!user.is_pro)
      throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
  }
}

async function checkProjectProLimitReachedAndAuth(
  projectId: number | undefined,
  sessionUser: string | number | undefined
) {
  if (!sessionUser) throw new Error("User is not logged in");
  if (!projectId) throw new Error("Missing project ID");

  const projectData = await getProjectQuery(projectId);
  const project = projectData.rows[0];
  // auth
  if (sessionUser != project.user_id) {
    const projectUserData = await getProjectUserByUserAndProjectQuery(
      sessionUser,
      projectId
    );
    if (!projectUserData.rows.length)
      throw new Error("Not authorized to update this resource");
  }

  const projectDataCount = project.used_data_in_bytes;
  const ONE_HUNDRED_MEGABYTES_IN_BYTES = 104857600;
  if (projectDataCount >= ONE_HUNDRED_MEGABYTES_IN_BYTES) {
    const userData = await getUserByIdQuery(project.user_id);
    const projectUser = userData.rows[0];
    if (!projectUser.is_pro)
      throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
  }
}

async function makeImageSmall(filePath: string) {
  const smallImageWidth: number = 100;
  const imageMetadata = await getMetadata(filePath);
  if (
    imageMetadata &&
    imageMetadata.height &&
    imageMetadata.width &&
    imageMetadata.width > smallImageWidth
  ) {
    const aspectRatio = imageMetadata.width / imageMetadata.height;
    const newFilePathFromResizedImage = await resizeImage(
      filePath,
      smallImageWidth,
      smallImageWidth / aspectRatio
    );
    // on success
    // remove previous file
    unlinkSync(filePath);
    // return new file location
    return newFilePathFromResizedImage;
  } else return null;
}

async function newImageForProject(
  req: NewImageForProjectRequestObject,
  res: Response,
  next: NextFunction
) {
  // error if no file
  if (!req.file) return next();
  // setup
  let filePath = `file_uploads/${req.file.filename}`;
  let image = null;

  try {
    // check project data usage and pro account status
    await checkProjectProLimitReachedAndAuth(
      req.body.project_id,
      req.session.user
    );

    const params = computeAwsImageParamsFromRequest(req, filePath);
    let fileSize = req.file.size;

    // adjust image size
    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      // if we have a new file
      if (newFilePathFromResizedImage) {
        // set new file path to resized image
        filePath = newFilePathFromResizedImage;
        // update params for aws upload
        params.Body = readFileSync(newFilePathFromResizedImage);
        // update file size
        const stats = statSync(newFilePathFromResizedImage);
        const fileSizeInBytes = stats.size;
        fileSize = fileSizeInBytes;
      }
    }

    // save image in db
    const imageData = await addImageQuery({
      original_name: req.file.originalname,
      size: fileSize,
      file_name: params.Key,
    });
    image = imageData.rows[0];

    // make an upload to s3 bucket
    await new Promise((resolve, reject) => {
      s3.upload(params, (err: any, data: { Location: unknown }) => {
        if (err) {
          reject(err);
        }
        resolve(data.Location);
      });
    });
    // send back to client
    res.send(image);
  } catch (err) {
    // delete file in storage
    unlinkSync(filePath);
    return next(err);
  }
  // continue

  // delete file in storage
  unlinkSync(filePath);

  try {
    // prepare to update project data usage
    let dataUsageCount = 0;
    dataUsageCount += image.size;
    // if current file, remove current file (which is being replaced with the new file) from the bucket
    if (req.body.current_file_id) {
      const oldImageData = await getImageQuery(req.body.current_file_id);
      const oldImage = oldImageData.rows[0];

      await removeImage(
        `${req.body.bucket_name}/${req.body.folder_name}`,
        oldImage
      );
      await removeImageQuery(req.body.current_file_id);

      dataUsageCount -= oldImage.size;
    }
    // update project data usage
    const projectData = await getProjectQuery(req.body.project_id);
    const project = projectData.rows[0];
    const newCalculatedData = project.used_data_in_bytes + dataUsageCount;
    await editProjectQuery(project.id, {
      used_data_in_bytes: newCalculatedData,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

interface NewImageForUserRequestObject extends Request {
  body: {
    bucket_name: string;
    folder_name: string;
    make_image_small: boolean;
  };
}

async function newImageForUser(
  req: NewImageForUserRequestObject,
  res: Response,
  next: NextFunction
) {
  // error if no file
  if (!req.file) return next();
  // setup
  let filePath = `file_uploads/${req.file.filename}`;
  let image = null;

  try {
    if (!req.session.user) throw new Error("User is not logged in");
    // check project data usage and pro account status
    await checkUserProLimitReachedAndAuth(req.session.user);

    const params = computeAwsImageParamsFromRequest(req, filePath);
    let fileSize = req.file.size;

    // adjust image size
    if (req.body.make_image_small) {
      const newFilePathFromResizedImage = await makeImageSmall(filePath);
      // if we have a new file
      if (newFilePathFromResizedImage) {
        // set new file path to resized image
        filePath = newFilePathFromResizedImage;
        // update params for aws upload
        params.Body = readFileSync(newFilePathFromResizedImage);
        // update file size
        const stats = statSync(newFilePathFromResizedImage);
        const fileSizeInBytes = stats.size;
        fileSize = fileSizeInBytes;
      }
    }

    // save image in db
    const imageData = await addImageQuery({
      original_name: req.file.originalname,
      size: fileSize,
      file_name: params.Key,
    });
    image = imageData.rows[0];

    // make an upload to s3 bucket
    await new Promise((resolve, reject) => {
      s3.upload(params, (err: any, data: { Location: unknown }) => {
        if (err) {
          reject(err);
        }
        resolve(data.Location);
      });
    });
    // send back to client
    res.send(image);
  } catch (err) {
    // delete file in storage
    unlinkSync(filePath);
    return next(err);
  }
  // continue

  // delete file in storage
  unlinkSync(filePath);

  try {
    // prepare to update project data usage
    let dataUsageCount = 0;
    dataUsageCount += image.size;
    // update project data usage
    const userData = await getUserByIdQuery(req.session.user);
    const user = userData.rows[0];
    const newCalculatedData = user.used_data_in_bytes + dataUsageCount;
    await editUserQuery(user.id, {
      used_data_in_bytes: newCalculatedData,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function getImage(req: Request, res: Response, next: NextFunction) {
  try {
    const imageData = await getImageQuery(req.params.id);
    res.send(imageData.rows[0]);
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function removeImageByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // remove current file
    const imageData = await getImageQuery(req.params.image_id);
    const image = imageData.rows[0];

    await removeImage("wyrld/images", image);
    await removeImageQuery(req.params.image_id);

    // update project data usage
    const projectData = await getProjectQuery(req.params.project_id);
    const project = projectData.rows[0];
    const newCalculatedData = project.used_data_in_bytes - image.size;
    await editProjectQuery(project.id, {
      used_data_in_bytes: newCalculatedData,
    });
    res.status(204).send();
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function removeImageByTableUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // remove current file
    const imageData = await getImageQuery(req.params.image_id);
    const image = imageData.rows[0];

    await removeImage("wyrld/images", image);
    await removeImageQuery(req.params.image_id);

    // get table
    const tableData = await getTableViewQuery(req.params.table_id);
    const table = tableData.rows[0];

    // update user data usage
    const userData = await getUserByIdQuery(table.user_id);
    const user = userData.rows[0];
    const newCalculatedData = user.used_data_in_bytes - image.size;
    await editUserQuery(user.id, {
      used_data_in_bytes: newCalculatedData,
    });
    res.status(204).send();
  } catch (err) {
    console.log(err);
    next(err);
  }
}

async function removeImage(bucket: string, image: { file_name: string }) {
  try {
    const params = {
      Bucket: bucket,
      Key: image.file_name,
    };

    await new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data.DeleteMarker);
      });
    });
  } catch (err) {
    console.log(err);
  }
}

async function editImageName(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editImageQuery(req.params.id, {
      original_name: req.body.original_name,
    });
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getSignedUrlForDownload,
  getImage,
  editImageName,
  newImageForProject,
  newImageForUser,
  removeImage,
  removeImageByProject,
  removeImageByTableUser,
};
