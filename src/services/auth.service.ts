import axios from 'axios';
import { config } from '../config';
import { TwitchTokenResponse, TwitchUserData, CachedUserData } from '../types';
import { TWITCH_API, CACHE_TTL } from '../utils/constants';
import { generateTempId } from '../utils/helpers';

class AuthService {
  private userCache: Map<string, CachedUserData>;

  constructor() {
    this.userCache = new Map();
  }

  async exchangeCodeForToken(code: string): Promise<TwitchTokenResponse> {
    const response = await axios.post<TwitchTokenResponse>(TWITCH_API.TOKEN_URL, null, {
      params: {
        client_id: config.twitch.clientId,
        client_secret: config.twitch.clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: config.twitch.redirectUri,
      },
    });

    return response.data;
  }

  async getTwitchUser(accessToken: string): Promise<TwitchUserData> {
    const response = await axios.get<{ data: TwitchUserData[] }>(TWITCH_API.USERS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Client-Id': config.twitch.clientId,
      },
    });

    return response.data.data[0];
  }

  cacheUserData(userData: CachedUserData): string {
    const tempId = generateTempId();
    this.userCache.set(tempId, userData);

    // Auto-cleanup after TTL
    setTimeout(() => {
      this.userCache.delete(tempId);
    }, CACHE_TTL);

    return tempId;
  }

  getCachedUserData(tempId: string): CachedUserData | undefined {
    return this.userCache.get(tempId);
  }

  deleteCachedUserData(tempId: string): boolean {
    return this.userCache.delete(tempId);
  }

  getOAuthInfo(): { clientId: string; redirectUri: string } {
    return {
      clientId: config.twitch.clientId,
      redirectUri: config.twitch.redirectUri,
    };
  }

  isUserAllowed(userId: string): boolean {
    return config.allowedUsers.includes(userId);
  }
}

export const authService = new AuthService();
