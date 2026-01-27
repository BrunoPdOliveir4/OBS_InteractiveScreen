export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const MAX_ELEMENTS_PER_ROOM = 5;

export const TWITCH_API = {
  TOKEN_URL: 'https://id.twitch.tv/oauth2/token',
  USERS_URL: 'https://api.twitch.tv/helix/users',
};

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Acesso nao autorizado',
  AUTH_CODE_REQUIRED: 'Codigo de autorizacao nao fornecido',
  USERNAME_REQUIRED: 'Username is required.',
  OWNER_NOT_FOUND: 'Owner user not found.',
  USER_ALREADY_IN_WHITELIST: 'Usuario ja esta na Whitelist!',
  CANNOT_REMOVE_SELF: 'You cannot remove yourself from the whitelist.',
  WHITELIST_PARAMS_REQUIRED: 'username and check are required in query.',
  PROFILE_ERROR: 'Erro ao obter informacoes do perfil',
  TOKEN_ERROR: 'Erro ao obter o token de acesso',
};

export const SUCCESS_MESSAGES = {
  WELCOME_FEMALE: 'Bem vinda,',
  WELCOME_MALE: 'Bem vindo,',
};
