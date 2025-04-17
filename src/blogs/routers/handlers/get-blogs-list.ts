import { Request, Response } from "express";
import { HttpStatus } from "../../../core/types/http-statuses";

import { mapToBlogViewModel } from "../../mappers/map-to-blog-view-model.util";
import { blogsService } from "../../application/blogs.service";
import { handleError } from "../../../core/errors/errors.handler";
import { BlogerQueryInput } from "../../types/blog-query.input";
import { setDefaultSortAndPaginationIfNotExist } from "../../../core/heipers/set-default-sort-and-pagination";
import { mapToBlogListPaginatedOutput } from "../../mappers/map-to-blog-list-paginated-output.util";

export async function getBlogsListHandler(
  req: Request<{}, {}, {}, BlogerQueryInput>,
  res: Response,
) {

  try {
    const queryInput = setDefaultSortAndPaginationIfNotExist(req.query);

    const { items, totalCount } = await blogsService.findMany(queryInput);

    const blogsListOutput = mapToBlogListPaginatedOutput(items, {
      pageNumber: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      totalCount,
    });

    res.send(blogsListOutput);
  } catch (e: unknown) {
    handleError(e, res);
  }
}
