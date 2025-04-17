import { PaginatedOutput } from "../../core/types/paginated.output";
import { blogViewModel } from "./blog-view-model";

export type BlogListPaginatedOutput = {
  meta: PaginatedOutput;
  data: blogViewModel[];
};
