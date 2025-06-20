import { mapToDeviceListOutput } from "../../security/mappers/map-to-device-list-output.util";
import { SessionModel } from "../domain/session.entity";

export const authQueryRepositories = {
  async deviceSessionList(userId: string) {
    const sessions = await SessionModel.find({ userId, deletedAt: null });

    return mapToDeviceListOutput(sessions);
  },
};
