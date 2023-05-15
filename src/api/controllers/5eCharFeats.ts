import {
  add5eCharFeatQuery,
  get5eCharFeatQuery,
  get5eCharFeatsByGeneralQuery,
  remove5eCharFeatQuery,
  edit5eCharFeatQuery,
} from "../queries/5eCharFeats";
import { Request, Response, NextFunction } from "express";

async function add5eCharFeat(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await add5eCharFeatQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharFeatsByGeneral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await get5eCharFeatsByGeneralQuery(req.params.general_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharFeat(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await remove5eCharFeatQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharFeat(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await edit5eCharFeatQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  get5eCharFeatsByGeneral,
  add5eCharFeat,
  remove5eCharFeat,
  edit5eCharFeat,
};
