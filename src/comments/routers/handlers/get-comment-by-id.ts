import { Request, Response } from "express";
import { HttpStatus } from "../../../core/types/http-statuses";
import { commentsQueryRepositories } from "../../repositories/comments.queryRepository";

export async function getCommentByIdHandler(req: Request, res: Response) {
  const id = req.params.commentId;
  const findComments = await commentsQueryRepositories.findCommentsById(id);
  if (!findComments) {
    res.sendStatus(HttpStatus.NotFound);
  }
  res.status(HttpStatus.Ok).send(findComments);
}
