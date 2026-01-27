import { TypedSocket } from '../../types/socket.types';
import { roomService } from '../../services/room.service';
import { authService } from '../../services/auth.service';
import { extractUserIdFromUrl } from '../../utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';
import { config } from '../../config';

export const handleConnection = (socket: TypedSocket): void => {
  const referer = socket.handshake.headers.referer;
  const userId = extractUserIdFromUrl(referer);

  // Validate user access
  if (!userId || !authService.isUserAllowed(userId)) {
    socket.emit('connect-erro', ERROR_MESSAGES.UNAUTHORIZED);
    socket.disconnect();
    return;
  }

  // Join user's room
  socket.join(userId);
  socket.data.userId = userId;

  // Initialize room and get existing state
  roomService.getOrCreateRoom(userId);
  const currentState = roomService.getRoomState(userId);

  // Send initial state if exists
  if (currentState.length > 0) {
    socket.emit('estado-inicial', currentState);
  }

  // Send welcome message
  const welcomePrefix =
    userId === config.allowedUsers[1]
      ? SUCCESS_MESSAGES.WELCOME_FEMALE
      : SUCCESS_MESSAGES.WELCOME_MALE;
  socket.emit('welcome', `${welcomePrefix} ${userId}!`);

  // Register socket in room service
  roomService.registerSocket(socket.id, userId);

  console.log(`Socket connected: ${socket.id} joined room ${userId}`);
};

export const handleDisconnection = (socket: TypedSocket): void => {
  const roomId = roomService.unregisterSocket(socket.id);
  console.log(`Socket disconnected: ${socket.id}${roomId ? ` from room ${roomId}` : ''}`);
};
