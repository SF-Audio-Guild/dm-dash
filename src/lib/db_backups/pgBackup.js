const { exec } = require("child_process");
const fs = require("fs");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../.env" });
const mail = require("../../api/smtp");

AWS.config.update({
  signatureVersion: "v4",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1",
});

const s3 = new AWS.S3();

function pgBackup() {
  function doBackup() {
    const command = `pg_dump --data-only --no-acl ${process.env.DATABASE_URL} > backup.sql`;

    exec(command, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        return;
      }

      // the *entire* stdout and stderr (buffered)
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  }

  async function uploadToAws() {
    const filename = "backup.sql";
    const fileContent = fs.readFileSync(filename);

    const params = {
      Bucket: "wyrld/pg_backups",
      Key: filename,
      Body: fileContent,
    };
    try {
      const res = await new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(data.Location);
        });
      });
      return res;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async function runBackup() {
    async function doTheThing() {
      console.log("Running backup");
      doBackup();
      // upload to aws
      const uploadStatus = await uploadToAws();
      console.log(uploadStatus);
      // send email
      mail.sendMessage({
        user: { email: "farreachco@gmail.com" },
        title: "Database Backup",
        message: `This information will either be a location of the new backup file, or an error message: ${uploadStatus}`,
      });
    }

    // do it once on start then do it again every day
    await doTheThing();
    setInterval(async () => {
      await doTheThing();
    }, 60 * 1000 * 60 * 24);
  }

  runBackup();
}

pgBackup();

module.exports = pgBackup;
