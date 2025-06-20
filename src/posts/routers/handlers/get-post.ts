import { Request, Response } from "express";
import { HttpStatus } from "../../../core/types/http-statuses";
import { container } from "../../../composition-root";
import { PostsQueryRepository } from "../../repositories/posts.queryRepository";

const postsQueryRepository = container.get(PostsQueryRepository);

export async function getPostHandler(req: Request, res: Response) {
  const id = req.params.id;
  const userId = req.user?.id ?? null;
  const post = await postsQueryRepository.findPostById(id, userId);

  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  res.status(HttpStatus.Ok).send(post);
}
