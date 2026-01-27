import { roomRepository } from '../repositories/room.repository';
import { Element } from '../types/element.types';

class RoomService {
  private socketRooms: Map<string, string>; // socketId -> roomId

  constructor() {
    this.socketRooms = new Map();
  }

  initializeRoom(roomId: string): Element[] {
    return roomRepository.initRoom(roomId);
  }

  getOrCreateRoom(roomId: string): Element[] {
    const existing = roomRepository.getRoom(roomId);
    if (existing) {
      return existing;
    }
    return this.initializeRoom(roomId);
  }

  getRoomState(roomId: string): Element[] {
    return roomRepository.getState(roomId);
  }

  addOrUpdateElement(roomId: string, element: Element): void {
    roomRepository.addOrUpdateElement(roomId, element);
  }

  removeElement(roomId: string, elementId: string): void {
    roomRepository.removeElement(roomId, elementId);
  }

  clearRoom(roomId: string): void {
    roomRepository.clearRoom(roomId);
  }

  // Socket-room mapping
  registerSocket(socketId: string, roomId: string): void {
    this.socketRooms.set(socketId, roomId);
  }

  unregisterSocket(socketId: string): string | undefined {
    const roomId = this.socketRooms.get(socketId);
    this.socketRooms.delete(socketId);
    return roomId;
  }

  getSocketRoom(socketId: string): string | undefined {
    return this.socketRooms.get(socketId);
  }

  getRoomSocketCount(roomId: string): number {
    let count = 0;
    for (const [, room] of this.socketRooms) {
      if (room === roomId) {
        count++;
      }
    }
    return count;
  }
}

export const roomService = new RoomService();
