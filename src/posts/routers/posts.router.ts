import { Router, Request, Response } from "express";
import { getPostsListHandler } from "./handlers/get-posts-list";
import { getPostHandler } from "./handlers/get-post";
import { deletePostHandler } from "./handlers/delete-post";
import { createPostHandler } from "./handlers/create-post";
import { updatePostHandler } from "./handlers/update-post";
import {postsInputDtoValidation} from "../validation/posts.input-dto.validation-middlewares";
import {inputValidationResultMiddleware} from "../../core/middlewares/validation/input-validtion-result.middleware";
import {idValidation} from "../../core/middlewares/validation/params-id.validation-middleware";

export const postsRouter = Router({});

postsRouter.get("", getPostsListHandler);

postsRouter.get("/:id", idValidation, inputValidationResultMiddleware, getPostHandler);

postsRouter.delete("/:id", idValidation, inputValidationResultMiddleware, deletePostHandler);

postsRouter.post("", postsInputDtoValidation, inputValidationResultMiddleware, createPostHandler);

postsRouter.put("/:id", idValidation, postsInputDtoValidation, inputValidationResultMiddleware, updatePostHandler);
