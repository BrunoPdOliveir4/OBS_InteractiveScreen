import { Element } from '../types/element.types';

export interface Room {
  id: string;
  elements: Element[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomState {
  roomId: string;
  elements: Element[];
}
