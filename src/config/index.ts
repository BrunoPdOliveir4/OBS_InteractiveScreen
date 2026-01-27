import dotenv from 'dotenv';

dotenv.config();

interface TwitchConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface Config {
  port: number;
  mongoUri: string;
  twitch: TwitchConfig;
  allowedUsers: string[];
  nodeEnv: string;
}

const getAllowedUsers = (): string[] => {
  const users: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const user = process.env[`TESTER${i}`];
    if (user) {
      users.push(user);
    }
  }
  return users;
};

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGO_URI || '',
  twitch: {
    clientId: process.env.TWITCH_ID || '',
    clientSecret: process.env.TWITCH_SECRET || '',
    redirectUri: process.env.REDIRECT_URI || '',
  },
  allowedUsers: getAllowedUsers(),
  nodeEnv: process.env.NODE_ENV || 'development',
};

export const validateConfig = (): void => {
  if (!config.mongoUri) {
    throw new Error('MONGO_URI environment variable is required');
  }
  if (!config.twitch.clientId) {
    throw new Error('TWITCH_ID environment variable is required');
  }
  if (!config.twitch.clientSecret) {
    throw new Error('TWITCH_SECRET environment variable is required');
  }
  if (!config.twitch.redirectUri) {
    throw new Error('REDIRECT_URI environment variable is required');
  }
};
