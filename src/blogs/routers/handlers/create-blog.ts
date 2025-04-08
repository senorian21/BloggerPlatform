import { Request, Response } from "express";
import { db } from "../../../db/in-memory.db";
import { HttpStatus } from "../../../core/types/http-statuses";
import { Blog } from "../../types/blog";
import { blogsRepositories } from "../../repositories/blogs.repository";
import { mapToBlogViewModel } from "../../mappers/map-to-blog-view-model.util";

export async function createBlogHandler(req: Request, res: Response) {
  const newBlog: Blog = {
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
    createdAt: new Date().toISOString(),
    isMembership: false,
  };
  const createdBlog = await blogsRepositories.createBlog(newBlog);
  const blogViewModel = mapToBlogViewModel(createdBlog);
  res.status(HttpStatus.Created).send(blogViewModel);
}
