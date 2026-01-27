import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { TypedServer, TypedSocket } from '../types/socket.types';
import { handleConnection, handleDisconnection } from './handlers/connection.handler';
import { registerElementHandlers } from './handlers/element.handler';
import { registerDrawingHandlers } from './handlers/drawing.handler';

let io: TypedServer;

export const initializeSocket = (server: HttpServer): TypedServer => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: TypedSocket) => {
    // Handle connection and validation
    handleConnection(socket);

    // Only register handlers if user was validated
    if (socket.data.userId) {
      registerElementHandlers(socket);
      registerDrawingHandlers(socket);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      handleDisconnection(socket);
    });
  });

  return io;
};

export const getSocketServer = (): TypedServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initializeSocket first.');
  }
  return io;
};
