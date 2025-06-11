import { randomUUID } from "crypto";
import { add } from "date-fns/add";
import { UserModel } from "../../src/users/domain/user.entity";

type RegisterUserPayloadType = {
  login: string;
  pass: string;
  email: string;
  code?: string;
  expirationDate?: Date;
  isConfirmed?: boolean;
};

export type RegisterUserResultType = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  emailConfirmation: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
};

export const testSeeder = {
  createUserDto() {
    return {
      login: "testing",
      email: "test@gmail.com",
      pass: "123456789",
    };
  },
  createUserDtos(count: number) {
    const users = [];

    for (let i = 0; i <= count; i++) {
      users.push({
        login: "test" + i,
        email: `test${i}@gmail.com`,
        pass: "12345678",
      });
    }
    return users;
  },
  async insertUser({
    login,
    pass,
    email,
    code,
    expirationDate,
    isConfirmed,
  }: RegisterUserPayloadType): Promise<RegisterUserResultType> {
    const newUser = {
      login,
      email,
      passwordHash: pass,
      createdAt: new Date(),
      emailConfirmation: {
        confirmationCode: code ?? randomUUID(),
        expirationDate: expirationDate ?? add(new Date(), { minutes: 30 }),
        isConfirmed: isConfirmed ?? false,
      },
    };

    const res = await UserModel.insertOne({ ...newUser });
    return {
      id: res._id.toString(),
      ...newUser,
    };
  },
};
