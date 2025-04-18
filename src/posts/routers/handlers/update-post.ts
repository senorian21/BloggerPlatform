import { Request, Response } from "express";
import { HttpStatus } from "../../../core/types/http-statuses";
import { Post } from "../../../posts/types/post";
import { postsService } from "../../application/posts.service";
import { blogsService } from "../../../blogs/application/blogs.service";

export async function updatePostHandler(req: Request, res: Response) {
  const id = req.params.id;

  const blogId = req.body.blogId;
  const blog = await blogsService.findById(blogId);
  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  const post = await postsService.findPostById(id);
  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  const dto: Post = {
    ...post,
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    content: req.body.content,
    blogId: blog._id.toString(),
    blogName: blog.name,
  };

  postsService.updatePost(id, dto);

  res.sendStatus(HttpStatus.NoContent);
}
