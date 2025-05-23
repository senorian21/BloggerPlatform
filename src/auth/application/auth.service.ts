import { userRepository } from "../../users/repositories/users.repository";
import { User } from "../../users/types/user";
import { Result } from "../../core/result/result.type";
import { WithId } from "mongodb";
import { ResultStatus } from "../../core/result/resultCode";
import { argon2Service } from "../adapters/argon2.service";
import { jwtService } from "../adapters/jwt.service";
import { nodemailerService } from "../adapters/nodemailer.service";
import { emailExamples } from "../adapters/emailExamples";
import { randomUUID } from "crypto";
import { add } from "date-fns";
import { createHash } from 'crypto'
import {authRepositories} from "../repositories/auth.Repository";

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}


export const authService = {
  async loginUser(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<{ accessToken: string; cookie: string } | null>> {
    const result = await this.checkUserCredentials(loginOrEmail, password);
    if (result.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Unauthorized",
        extensions: [{ field: "loginOrEmail", message: "Wrong credentials" }],
        data: null,
      };
    }
    const accessToken = await jwtService.createToken(
      result.data!._id.toString(),
    );
    const { cookie } = await jwtService.createRefreshToken(
      result.data!._id.toString(),
    );
    return {
      status: ResultStatus.Success,
      data: {
        accessToken,
        cookie,
      },
      extensions: [],
    };
  },

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<WithId<User> | null>> {
    const user = await userRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: "Not Found",
        extensions: [{ field: "loginOrEmail", message: "Not Found" }],
      };
    }

    const isPassCorrect = await argon2Service.checkPassword(
      password,
      user.passwordHash,
    );
    if (!isPassCorrect) {
      return {
        status: ResultStatus.Unauthorized,
        data: null,
        errorMessage: "Bad request",
        extensions: [{ field: "password", message: "Wrong password" }],
      };
    }

    return {
      status: ResultStatus.Success,
      data: user,
      extensions: [],
    };
  },

  async registerUser(
    login: string,
    password: string,
    email: string,
  ): Promise<Result<string | null>> {
    const user = await userRepository.doesExistByLoginOrEmail(login, email);
    if (user) {
      if (user.login === login) {
        return {
          status: ResultStatus.BadRequest,
          errorMessage: "Bad Request",
          data: null,
          extensions: [{ field: "login", message: "Login is already taken" }],
        };
      } else {
        return {
          status: ResultStatus.BadRequest,
          errorMessage: "Bad Request",
          data: null,
          extensions: [
            { field: "email", message: "Email is already registered" },
          ],
        };
      }
    }

    const passwordHash = await argon2Service.generateHash(password);
    const newUser = new User(login, email, passwordHash);
    const createdUser = await userRepository.createUser(newUser);

    nodemailerService
      .sendEmail(
        newUser.email,
        newUser.emailConfirmation.confirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((er) => console.error("error in send email:", er));

    return {
      status: ResultStatus.Success,
      data: createdUser,
      extensions: [],
    };
  },

  async registrationConfirmationUser(
    code: string,
  ): Promise<Result<WithId<User> | null>> {
    const user = await userRepository.findByCode(code);
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "code", message: "there is no such code" }],
      };
    }

    const userId = user!._id.toString();

    if (user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "isConfirmed", message: "Already confirmed" }],
      };
    }
    if (user.emailConfirmation.expirationDate < new Date()) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [
          { field: "expirationDate", message: "confirmation time expired" },
        ],
      };
    }
    const confirmUser = await userRepository.registrationConfirmationUser(
      user,
      userId,
    );
    if (confirmUser.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "", message: "" }],
      };
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },

  async registrationEmailResending(
    email: string,
  ): Promise<Result<string | null>> {
    const user = await userRepository.findByLoginOrEmail(email);
    if (!user) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "email", message: "User not found" }],
      };
    }

    if (user.emailConfirmation.isConfirmed) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [{ field: "isConfirmed", message: "Already confirmed" }],
      };
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      return {
        status: ResultStatus.BadRequest,
        errorMessage: "Bad Request",
        data: null,
        extensions: [
          {
            field: "emailConfirmation.expirationDate",
            message: "Confirmation time expired",
          },
        ],
      };
    }

    const newConfirmationCode = randomUUID();
    const newExpirationDate = add(new Date(), { days: 7 });

    await userRepository.updateConfirmationCodeAndExpiration(
      user._id.toString(),
      newConfirmationCode,
      newExpirationDate,
    );

    nodemailerService
      .sendEmail(
        user.email,
        newConfirmationCode,
        emailExamples.registrationEmail,
      )
      .catch((er) => console.error("Error in send email:", er));

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },

  async refreshToken(refreshToken: string) {
    const payload = await jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Invalid token signature or expired",
        data: null,
        extensions: [],
      };
    }

    const userId = payload.userId;
    const tokenHash = hashToken(refreshToken);

    const tokenInBlacklist = await authRepositories.findTokenByBlackList(tokenHash);
    if (tokenInBlacklist) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Token is blacklisted",
        data: null,
        extensions: [],
      };
    }

    const newAccessToken = await jwtService.createToken(userId);
    const { cookie } = await jwtService.createRefreshToken(userId);

    await authRepositories.addRefreshTokenBlackList({
      tokenHash,
      userId,
      createdAt: new Date(),
    });

    return {
      status: ResultStatus.Success,
      data: { newAccessToken, cookie },
      extensions: [],
    };
  },

  async logout(refreshToken: string) {
    const payload = await jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Invalid token signature or expired",
        data: null,
        extensions: [],
      };
    }

    const userId = payload.userId;
    const tokenHash = hashToken(refreshToken);
    const tokenInBlacklist = await authRepositories.findTokenByBlackList(tokenHash);
    if (tokenInBlacklist) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: "Token is blacklisted",
        data: null,
        extensions: [],
      };
    }
    await authRepositories.addRefreshTokenBlackList({
      tokenHash,
      userId,
      createdAt: new Date(),
    });
    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  }
};
