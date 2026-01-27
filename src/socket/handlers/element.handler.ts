import { TypedSocket } from '../../types/socket.types';
import { roomService } from '../../services/room.service';
import {
  Element,
  ElementPosition,
  ElementSize,
  TextElementUpdate,
  ElementId,
} from '../../types/element.types';

export const registerElementHandlers = (socket: TypedSocket): void => {
  const userId = socket.data.userId;
  if (!userId) return;

  // New element
  socket.on('novo-elemento', (data: Element) => {
    roomService.addOrUpdateElement(userId, data);
    socket.to(userId).emit('novo-elemento', data);
  });

  // Move element
  socket.on('mover-elemento', (data: ElementPosition) => {
    const element = { id: data.id, left: data.left, top: data.top } as Element;
    roomService.addOrUpdateElement(userId, element);
    socket.to(userId).emit('mover-elemento', data);
  });

  // Resize element
  socket.on('redimensionar-elemento', (data: ElementSize) => {
    const element = { id: data.id, width: data.width, height: data.height } as Element;
    roomService.addOrUpdateElement(userId, element);
    socket.to(userId).emit('redimensionar-elemento', data);
  });

  // Edit text element
  socket.on('editar-elemento', (data: TextElementUpdate) => {
    const element = {
      id: data.id,
      content: data.content,
      color: data.color,
      fontSize: data.size,
      fontFamily: data.font,
    } as Element;
    roomService.addOrUpdateElement(userId, element);
    socket.to(userId).emit('editar-elemento', data);
  });

  // Remove element
  socket.on('remover-elemento', (data: ElementId) => {
    roomService.removeElement(userId, data.id);
    socket.to(userId).emit('remover-elemento', data);
  });

  // Remove all elements
  socket.on('remover-tudo', () => {
    roomService.clearRoom(userId);
    socket.to(userId).emit('remover-tudo');
  });

  // Hide element
  socket.on('ocultar-elemento', (data: ElementId) => {
    socket.to(userId).emit('ocultar-elemento', data);
  });

  // Show element
  socket.on('mostrar-elemento', (data: ElementId) => {
    socket.to(userId).emit('mostrar-elemento', data);
  });
};
