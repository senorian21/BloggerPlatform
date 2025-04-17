import { BlogSortFields } from "./blog-sort-field";
import { PaginationAndSorting } from "../../core/types/pagination-and-sorting";

export type BlogerQueryInput = PaginationAndSorting<BlogSortFields> &
  Partial<{
    searchBlogNameTerm: string;
  }>;
