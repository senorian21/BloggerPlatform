import { Blog } from "../types/blog";
import { blogCollection } from "../../db/mongo.db";
import { ObjectId, WithId } from "mongodb";
import { BlogerQueryInput } from "../types/blog-query.input";

export const blogsRepositories = {
  async findAllBlogs(
    queryDto: BlogerQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchBlogNameTerm,
    } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {}

    if(searchBlogNameTerm){
      filter.name = {$regex: searchBlogNameTerm, $options: "i"};
    }

    const items = await blogCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray();

    const totalCount = await blogCollection.countDocuments(filter);

    return { items, totalCount };
  },

  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogCollection.findOne({ _id: new ObjectId(id) });
  },

  async createBlog(newBlog: Blog) {
    const result = await blogCollection.insertOne(newBlog);
    return { ...newBlog, _id: result.insertedId };
  },

  async updateBlog(id: string, dto: Blog) {
    const updateResult = await blogCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
          createdAt: dto.createdAt,
          isMembership: dto.isMembership,
        },
      },
    );
  },
  async deleteBlog(id: string) {
    const deleteResult = await blogCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteResult.deletedCount < 1) {
      throw new Error("Blog not exist");
    }
  },
};
