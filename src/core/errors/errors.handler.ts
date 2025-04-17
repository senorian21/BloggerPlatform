import { Response } from "express";
import { RepositoryNotFoundError } from "./repository-not-found.error";
import { HttpStatus } from "../types/http-statuses";
import { createErrorMessages } from "../middlewares/validation/input-validtion-result.middleware";
import { DomainError } from "./domain.error";

export function handleError(error: unknown, res: Response): void {
  if (error instanceof RepositoryNotFoundError) {
    const httpStatus = HttpStatus.NotFound;
    res.sendStatus(httpStatus);
    // res.status(httpStatus).send(createErrorMessages([
    //     {
    //
    //     }
    //]));

    return;
  }
  if (error instanceof DomainError) {
    const httpStatus = HttpStatus.UnprocessableEntity;
    res.sendStatus(httpStatus);
    // res.status(httpStatus).send(createErrorMessages([
    //     {
    //
    //     }
    // ]));

    return;
  }

  res.status(HttpStatus.InternalServerError);
  return;
}
