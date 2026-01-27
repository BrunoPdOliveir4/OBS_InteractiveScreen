import { TypedSocket } from '../../types/socket.types';
import { DrawingPoint } from '../../types/element.types';

export const registerDrawingHandlers = (socket: TypedSocket): void => {
  const userId = socket.data.userId;
  if (!userId) return;

  // Drawing stroke
  socket.on('desenho', (data: DrawingPoint) => {
    socket.to(userId).emit('desenho', data);
  });

  // Drawing stopped
  socket.on('parou-desenho', () => {
    socket.to(userId).emit('parou-desenho', 'ok');
  });

  // Erase at point
  socket.on('apagar', (data: DrawingPoint) => {
    socket.to(userId).emit('apagar', data);
  });

  // Clear all drawings
  socket.on('apagar-tudo', () => {
    socket.to(userId).emit('apagar-tudo');
  });
};
