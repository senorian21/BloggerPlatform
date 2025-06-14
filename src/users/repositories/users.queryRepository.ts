import { ObjectId } from "mongodb";
import { mapToUserViewModel } from "../mappers/map-to-user-view-model.util";
import { userQueryInput } from "../types/user-query.input";
import { userViewModel } from "../types/user-view-model";
import { mapToUserListPaginatedOutput } from "../mappers/map-to-user-list-paginated-output.util";
import { mapToAboutUserViewModel } from "../mappers/map-to-about-user-view-model.util";
import { injectable } from "inversify";
import { UserModel } from "../domain/user.entity";
@injectable()
export class UserQueryRepository {
  async findAllUser(
    queryDto: userQueryInput,
  ): Promise<{ items: userViewModel[]; totalCount: number }> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchEmailTerm,
      searchLoginTerm,
    } = queryDto;
    const skip = (pageNumber - 1) * pageSize;

    const filter: any = {
      $and: [
        { deletedAt: null },
        {
          $or: [],
        },
      ],
    };

    if (searchEmailTerm || searchLoginTerm) {
      if (searchEmailTerm && searchEmailTerm.trim() !== "") {
        filter.$and[1].$or.push({
          email: { $regex: searchEmailTerm, $options: "i" },
        });
      }
      if (searchLoginTerm && searchLoginTerm.trim() !== "") {
        filter.$and[1].$or.push({
          login: { $regex: searchLoginTerm, $options: "i" },
        });
      }
    }

    const items = await UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(+pageSize);

    const totalCount = await UserModel.countDocuments(filter);
    return mapToUserListPaginatedOutput(items, {
      pageNumber: +pageNumber,
      pageSize: +pageSize,
      totalCount,
    });
  }

  async findUserById(id: string) {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const user = await UserModel.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return null;
    }
    if (!user || user.deletedAt !== null) {
      return null;
    }
    return mapToUserViewModel(user);
  }

  async findUserByIdForAboutUser(id: string) {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const user = await UserModel.findOne({ _id: new ObjectId(id) });
    if (!user || user.deletedAt !== null) {
      return null;
    }
    return mapToAboutUserViewModel(user);
  }
}
