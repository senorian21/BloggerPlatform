import { config } from "dotenv";

config();

export const appConfig = {
  DB_NAME: (process.env.DB_NAME as string) || "BloggerPlatform",
  DB_NAME_TEST: (process.env.DB_NAME_TEST as string) || "BloggerPlatformTest",
  AC_SECRET: process.env.AC_SECRET as string,
  AC_TIME: process.env.AC_TIME as string,
  PORT: process.env.PORT || 5003,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
  YANDEX_EMAIL: process.env.YANDEX_EMAIL,
  YANDEX_PASSWORD: process.env.YANDEX_PASSWORD,
};
