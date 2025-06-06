import { Request, Response } from "express";
import { HttpStatus } from "../../../core/types/http-statuses";
import {
  blogsQueryRepositories,
  blogsService,
} from "../../../composition-root";

export async function deleteBlogHandler(req: Request, res: Response) {
  try {
    const id = req.params.blogId;
    const blog = await blogsQueryRepositories.findById(id);
    if (!blog) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    blogsService.deleteBlog(id);
    res.sendStatus(HttpStatus.NoContent);
  } catch (e) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
