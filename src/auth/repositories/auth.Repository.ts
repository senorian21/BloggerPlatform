import { injectable } from "inversify";
import {
  session,
  sessionDocument,
  SessionModel,
} from "../domain/session.entity";

@injectable()
export class AuthRepositories {
  async findSession(filters: {
    userId?: string;
    deviceId?: string;
    deviceName?: string;
  }) {
    const query: any = { deletedAt: null };

    if (filters.userId) {
      query.userId = filters.userId;
    }
    if (filters.deviceId) query.deviceId = filters.deviceId;
    if (filters.deviceName) query.deviceName = filters.deviceName;

    return await SessionModel.findOne(query);
  }

  async deleteDevice(deviceId: string, userId: string) {
    await SessionModel.updateMany(
      {
        $and: [{ userId: userId }, { deviceId: { $ne: deviceId } }],
      },
      { deletedAt: new Date() },
    );
  }
  async save(session: sessionDocument) {
    await session.save();
  }
}
