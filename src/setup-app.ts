import express, { Express } from "express";
import {
  AUTH_PATH,
  BLOGS_PATH,
  COMMENTS_PATH,
  POSTS_PATH,
  SECURITY_PATH,
  TESTING_PATH,
  USERS_PATH,
} from "./core/paths/paths";
import { testingRouter } from "./testing/routers/testing.router";
import { postsRouter } from "./posts/routers/posts.router";
import { blogsRouter } from "./blogs/routers/blogs.router";
import { usersRouter } from "./users/routers/users.router";
import { authRouter } from "./auth/routers/auth.router";
import { commentsRouter } from "./comments/routers/comments-router";
import { securityRouter } from "./security/routers/security.router";

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  app.use(TESTING_PATH, testingRouter);
  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(USERS_PATH, usersRouter);
  app.use(AUTH_PATH, authRouter);
  app.use(COMMENTS_PATH, commentsRouter);
  app.use(SECURITY_PATH, securityRouter);
  return app;
};
