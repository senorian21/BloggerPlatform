import { Request, Response } from "express";
import { HttpStatus } from "../../../core/types/http-statuses";
import { commentsQueryRepositories } from "../../../comments/repositories/comments.queryRepository";
import { ResultStatus } from "../../../core/result/resultCode";
import {
  commentsService,
  postsQueryRepository,
} from "../../../composition-root";

export async function createCommentHandler(req: Request, res: Response) {
  const postId = req.params.postId;
  const userId = req.user!.id;
  const post = await postsQueryRepository.findPostById(postId);
  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  const createdCommentId = await commentsService.createComment(
    req.body,
    userId,
    postId,
  );
  if (createdCommentId.status !== ResultStatus.Success) {
    res.sendStatus(HttpStatus.Unauthorized);
  }

  const createdComments = await commentsQueryRepositories.findCommentsById(
    createdCommentId.data!,
  );

  res.status(HttpStatus.Created).send(createdComments);
}
