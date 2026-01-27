/**
 * Frontend constants
 */

export const ELEMENT_TYPES = {
  TEXT: 'texto',
  IMAGE: 'imagem',
  VIDEO: 'video',
};

export const DEFAULT_ELEMENT_SIZES = {
  texto: { width: 200, height: 60 },
  imagem: { width: 300, height: 200 },
  video: { width: 320, height: 240 },
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECT_ERROR: 'connect-erro',
  WELCOME: 'welcome',
  INITIAL_STATE: 'estado-inicial',

  // Elements
  NEW_ELEMENT: 'novo-elemento',
  MOVE_ELEMENT: 'mover-elemento',
  RESIZE_ELEMENT: 'redimensionar-elemento',
  EDIT_ELEMENT: 'editar-elemento',
  REMOVE_ELEMENT: 'remover-elemento',
  REMOVE_ALL: 'remover-tudo',
  HIDE_ELEMENT: 'ocultar-elemento',
  SHOW_ELEMENT: 'mostrar-elemento',

  // Drawing
  DRAW: 'desenho',
  STOP_DRAW: 'parou-desenho',
  ERASE: 'apagar',
  ERASE_ALL: 'apagar-tudo',
};

export const ROUTES = {
  LOGIN: '/login',
  EDITOR: '/editor',
  SHOW: '/show',
  PROFILE: '/profile',
};

export const TWITCH_EMBED_URL = 'https://player.twitch.tv/';

export const FONTS = [
  'Arial',
  'Verdana',
  'Times New Roman',
  'Courier New',
  'Georgia',
];

export const ERASER_SIZE = 10;
export const MIN_ELEMENT_WIDTH = 100;
export const MIN_ELEMENT_HEIGHT = 40;
