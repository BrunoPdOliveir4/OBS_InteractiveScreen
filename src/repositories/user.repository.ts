import { User } from '../models/user.model';
import { IUser, IUserDocument } from '../types';

export class UserRepository {
  async findByUsername(username: string): Promise<IUserDocument | null> {
    return User.findOne({ username: username.toLowerCase() });
  }

  async create(userData: IUser): Promise<IUserDocument> {
    const user = new User({
      username: userData.username.toLowerCase(),
      whitelist: userData.whitelist || [],
    });
    return user.save();
  }

  async addToWhitelist(ownerUsername: string, usernameToAdd: string): Promise<IUserDocument | null> {
    return User.findOneAndUpdate(
      { username: ownerUsername.toLowerCase() },
      { $addToSet: { whitelist: usernameToAdd.toLowerCase() } },
      { new: true }
    );
  }

  async removeFromWhitelist(ownerUsername: string, usernameToRemove: string): Promise<IUserDocument | null> {
    return User.findOneAndUpdate(
      { username: ownerUsername.toLowerCase() },
      { $pull: { whitelist: usernameToRemove.toLowerCase() } },
      { new: true }
    );
  }

  async isUserWhitelisted(ownerUsername: string, usernameToCheck: string): Promise<boolean> {
    const user = await User.findOne({
      username: ownerUsername.toLowerCase(),
      whitelist: usernameToCheck.toLowerCase(),
    });
    return user !== null;
  }

  async getWhitelist(username: string): Promise<string[]> {
    const user = await this.findByUsername(username);
    return user?.whitelist || [];
  }
}

export const userRepository = new UserRepository();
