import { Element } from '../types/element.types';
import { MAX_ELEMENTS_PER_ROOM } from '../utils/constants';

export class RoomRepository {
  private roomData: Map<string, Element[]>;

  constructor() {
    this.roomData = new Map();
  }

  initRoom(roomId: string): Element[] {
    if (!this.roomData.has(roomId)) {
      this.roomData.set(roomId, []);
    }
    return this.roomData.get(roomId) || [];
  }

  getRoom(roomId: string): Element[] | undefined {
    return this.roomData.get(roomId);
  }

  getState(roomId: string): Element[] {
    return this.roomData.get(roomId) || [];
  }

  addOrUpdateElement(roomId: string, element: Element): void {
    let room = this.roomData.get(roomId);
    if (!room) {
      room = this.initRoom(roomId);
    }

    const index = room.findIndex((el) => el.id === element.id);

    if (index !== -1) {
      // Update existing element, merging properties
      const current = room[index];
      room[index] = { ...current, ...element };
    } else {
      // Add new element
      room.push(element);
      if (room.length > MAX_ELEMENTS_PER_ROOM) {
        room.shift(); // Remove oldest element
      }
    }
  }

  removeElement(roomId: string, elementId: string): void {
    const room = this.roomData.get(roomId);
    if (!room) return;

    this.roomData.set(
      roomId,
      room.filter((el) => el.id !== elementId)
    );
  }

  clearRoom(roomId: string): void {
    this.roomData.set(roomId, []);
  }

  deleteRoom(roomId: string): boolean {
    return this.roomData.delete(roomId);
  }

  hasRoom(roomId: string): boolean {
    return this.roomData.has(roomId);
  }

  getRoomCount(): number {
    return this.roomData.size;
  }
}

export const roomRepository = new RoomRepository();
