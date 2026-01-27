import { userRepository } from '../repositories/user.repository';
import { IUserDocument } from '../types';
import { ERROR_MESSAGES } from '../utils/constants';

export interface WhitelistResult {
  success: boolean;
  data?: IUserDocument;
  error?: string;
}

class WhitelistService {
  async addToWhitelist(
    ownerUsername: string,
    usernameToAdd: string
  ): Promise<WhitelistResult> {
    const owner = await userRepository.findByUsername(ownerUsername);

    if (!owner) {
      return { success: false, error: ERROR_MESSAGES.OWNER_NOT_FOUND };
    }

    if (owner.whitelist.includes(usernameToAdd.toLowerCase())) {
      return { success: false, error: ERROR_MESSAGES.USER_ALREADY_IN_WHITELIST };
    }

    const updatedUser = await userRepository.addToWhitelist(ownerUsername, usernameToAdd);

    if (!updatedUser) {
      return { success: false, error: ERROR_MESSAGES.OWNER_NOT_FOUND };
    }

    return { success: true, data: updatedUser };
  }

  async removeFromWhitelist(
    ownerUsername: string,
    usernameToRemove: string
  ): Promise<WhitelistResult> {
    if (ownerUsername.toLowerCase() === usernameToRemove.toLowerCase()) {
      return { success: false, error: ERROR_MESSAGES.CANNOT_REMOVE_SELF };
    }

    const owner = await userRepository.findByUsername(ownerUsername);

    if (!owner) {
      return { success: false, error: ERROR_MESSAGES.OWNER_NOT_FOUND };
    }

    const updatedUser = await userRepository.removeFromWhitelist(
      ownerUsername,
      usernameToRemove
    );

    if (!updatedUser) {
      return { success: false, error: ERROR_MESSAGES.OWNER_NOT_FOUND };
    }

    return { success: true, data: updatedUser };
  }

  async checkWhitelist(ownerUsername: string, usernameToCheck: string): Promise<boolean> {
    return userRepository.isUserWhitelisted(ownerUsername, usernameToCheck);
  }

  async getWhitelist(username: string): Promise<string[]> {
    return userRepository.getWhitelist(username);
  }
}

export const whitelistService = new WhitelistService();
