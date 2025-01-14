import {
  add5eCharAttackQuery,
  get5eCharAttackQuery,
  get5eCharAttacksByGeneralQuery,
  remove5eCharAttackQuery,
  edit5eCharAttackQuery,
} from "../queries/5eCharAttacks";
import { Request, Response, NextFunction } from "express";

async function add5eCharAttack(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await add5eCharAttackQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharAttacksByGeneral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await get5eCharAttacksByGeneralQuery(req.params.general_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharAttack(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await remove5eCharAttackQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharAttack(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }
    const data = await edit5eCharAttackQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  get5eCharAttacksByGeneral,
  add5eCharAttack,
  remove5eCharAttack,
  edit5eCharAttack,
};
