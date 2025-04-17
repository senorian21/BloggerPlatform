import { Blog } from "../types/blog";
import { WithId } from "mongodb";
import { blogsRepositories } from "../repositories/blogs.repository";
import { BlogerQueryInput } from "../types/blog-query.input";

export const blogsService = {
  async findMany(
      queryDto: BlogerQueryInput
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    return blogsRepositories.findAllBlogs(queryDto);
  },

  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsRepositories.findById(id);
  },

  async createBlog(dto: Blog) {
    const newBlog: Blog = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    return blogsRepositories.createBlog(newBlog);
  },

  async updateBlog(id: string, dto: Blog) {
    await blogsRepositories.updateBlog(id, dto);
  },
  async deleteBlog(id: string) {
    await blogsRepositories.deleteBlog(id);
  },
};
