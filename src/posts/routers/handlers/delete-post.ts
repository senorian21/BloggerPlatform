import { Router, Request, Response } from "express";
import { db } from "../../../db/in-memory.db";
import { HttpStatus } from "../../../core/types/http-statuses";
import { postsRepository } from "../../repositories/posts.repository";

export function deletePostHandler(req: Request, res: Response) {
  const id = req.params.id;
  postsRepository.deletePost(id);
  res.sendStatus(HttpStatus.NoContent);
}
