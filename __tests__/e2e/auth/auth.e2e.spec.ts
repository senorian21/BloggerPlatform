import express from "express";
import { setupApp } from "../../../src/setup-app";
import { clearDb } from "../utils/clear-db";
import { runDb } from "../../../src/db/mongo.db";
import { appConfig } from "../../../src/core/settings/settings";
import { createUser } from "../utils/users/create-user";
import request from "supertest";
import { AUTH_PATH } from "../../../src/core/paths/paths";
import { HttpStatus } from "../../../src/core/types/http-statuses";
import { UserInput } from "../../../src/users/dto/user.input-dto";
import { getUserDto } from "../utils/users/get-user-dto";

jest.mock("../../../src/auth/middlewares/rate.limited.guard", () => {
  return jest.fn((req, res, next) => {
    // Пропускаем следующий middleware без проверки
    next();
  });
});

describe("Auth API", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDb(appConfig.MONGO_URI); // Подключаемся к MongoDB
    await clearDb(app);
  });

  beforeEach(async () => {
    await clearDb(app);
  });

  it("should login user with valid credentials, /auth/login", async () => {
    const newUser: UserInput = {
      ...getUserDto(),
      login: "admin",
      password: "123456",
      email: "admin@example.com",
    };
    const user = await createUser(app, newUser);

    const response = await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: newUser.email, password: newUser.password });

    expect(response.status).toBe(HttpStatus.Ok);
    expect(response.body).toHaveProperty("accessToken");
  });

  it("should return 401 if invalid credentials, /auth/login", async () => {
    const newUser: UserInput = {
      ...getUserDto(),
      login: "admin",
      password: "123456",
      email: "admin@example.com",
    };
    const user = await createUser(app, newUser);

    const response = await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: newUser.email, password: "newUser.password" });

    expect(response.status).toBe(HttpStatus.Unauthorized);
  });

  it("about user, GET /auth/me", async () => {
    const newUser: UserInput = {
      ...getUserDto(),
      login: "admin",
      password: "123456",
      email: "admin@example.com",
    };

    const user = await createUser(app, newUser);

    const loginResponse = await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: newUser.email, password: newUser.password });

    expect(loginResponse.status).toBe(HttpStatus.Ok);

    const token = loginResponse.body.accessToken;

    const response = await request(app)
      .get(`${AUTH_PATH}/me`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(HttpStatus.Ok);
  });

  it("should successfully login and return access token with cookie header", async () => {
    const newUser: UserInput = {
      ...getUserDto(),
      login: "admin123",
      password: "1234567",
      email: "admin1@example1.com",
    };

    const user = await createUser(app, newUser);
    const response = await request(app)
      .post("/auth/login")
      .set("User-Agent", "supertest-agent") // указание user agent
      .send({
        loginOrEmail: newUser.login,
        password: newUser.password,
      });

    expect(response.status).toBe(HttpStatus.Ok);

    expect(response.body).toHaveProperty("accessToken");

    expect(response.headers["set-cookie"]).toBeDefined();
  });

  it("should return 401 when credentials are invalid", async () => {
    const response = await request(app)
      .post(`${AUTH_PATH}/login`)
      .set("User-Agent", "supertest-agent")
      .send({
        loginOrEmail: "InvalidUser",
        password: "WrongPassword",
      });

    expect(response.status).toBe(HttpStatus.Unauthorized);
  });

  it("Should not allow multiple refreshes with the same token", async () => {
    const user = await createUser(app);
    const loginRes = await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: user.email, password: "111111" })
      .expect(HttpStatus.Ok);

    const cookiesHeader = loginRes.headers["set-cookie"];

    const cookies = Array.isArray(cookiesHeader)
      ? cookiesHeader
      : [cookiesHeader];

    const refreshTokenCookie = cookies.find((cookie) =>
      cookie.startsWith("refreshToken="),
    );

    const originalRefreshToken = refreshTokenCookie.split(";")[0].split("=")[1];

    await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set("Cookie", `refreshToken=${originalRefreshToken}`)
      .expect(HttpStatus.Ok);

    await request(app)
      .post(`${AUTH_PATH}/refresh-token`)
      .set("Cookie", `refreshToken=${originalRefreshToken}`)
      .expect(HttpStatus.Unauthorized);
  });
});
