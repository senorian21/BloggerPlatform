import nodemailer from "nodemailer";
import { appConfig } from "../../core/settings/settings";

export const nodemailerService = {
  async sendEmail(
    email: string,
    code: string,
    template: (code: string) => string,
  ) {
    const transporter = nodemailer.createTransport({
      host: appConfig.SMTP_SERVER, // SMTP-сервер Яндекса
      port: 465, // Порт для SSL
      secure: true, // Использовать SSL
      auth: {
        user: appConfig.YANDEX_EMAIL, // Ваш email
        pass: appConfig.YANDEX_PASSWORD, // Ваш пароль или пароль приложения
      },
    });

    await transporter.sendMail({
      from: "BloggerPlatform <senorian2@yandex.by>",
      to: email,
      subject: "Registration",
      html: template(code),
    });
  },
};
