import { Document } from 'mongoose';

// User types
export interface IUser {
  username: string;
  whitelist: string[];
}

export interface IUserDocument extends IUser, Document {}

// Twitch OAuth types
export interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
}

export interface TwitchUserData {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

export interface CachedUserData extends TwitchUserData {
  access_token: string;
  whitelist?: string[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WhitelistCheckResponse {
  whitelisted: boolean;
}

export interface OAuthInfoResponse {
  clientId: string;
  redirectUri: string;
}
