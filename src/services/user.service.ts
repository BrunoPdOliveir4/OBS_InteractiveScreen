import { userRepository } from '../repositories/user.repository';
import { IUser, IUserDocument } from '../types';

class UserService {
  async findByUsername(username: string): Promise<IUserDocument | null> {
    return userRepository.findByUsername(username);
  }

  async createUser(username: string): Promise<IUserDocument> {
    const userData: IUser = {
      username,
      whitelist: [],
    };
    return userRepository.create(userData);
  }

  async findOrCreateUser(username: string): Promise<IUserDocument> {
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      return existingUser;
    }
    return this.createUser(username);
  }

  async getUserWhitelist(username: string): Promise<string[]> {
    return userRepository.getWhitelist(username);
  }
}

export const userService = new UserService();
