import { Socket, Server } from 'socket.io';
import {
  Element,
  ElementPosition,
  ElementSize,
  TextElementUpdate,
  ElementId,
  DrawingPoint,
} from './element.types';

// Client to Server events
export interface ClientToServerEvents {
  'novo-elemento': (data: Element) => void;
  'mover-elemento': (data: ElementPosition) => void;
  'redimensionar-elemento': (data: ElementSize) => void;
  'editar-elemento': (data: TextElementUpdate) => void;
  'remover-elemento': (data: ElementId) => void;
  'desenho': (data: DrawingPoint) => void;
  'parou-desenho': () => void;
  'apagar': (data: DrawingPoint) => void;
  'remover-tudo': () => void;
  'ocultar-elemento': (data: ElementId) => void;
  'mostrar-elemento': (data: ElementId) => void;
  'apagar-tudo': () => void;
}

// Server to Client events
export interface ServerToClientEvents {
  'connect-erro': (message: string) => void;
  'welcome': (message: string) => void;
  'estado-inicial': (elements: Element[]) => void;
  'novo-elemento': (data: Element) => void;
  'mover-elemento': (data: ElementPosition) => void;
  'redimensionar-elemento': (data: ElementSize) => void;
  'editar-elemento': (data: TextElementUpdate) => void;
  'remover-elemento': (data: ElementId) => void;
  'desenho': (data: DrawingPoint) => void;
  'parou-desenho': (status: string) => void;
  'apagar': (data: DrawingPoint) => void;
  'remover-tudo': () => void;
  'ocultar-elemento': (data: ElementId) => void;
  'mostrar-elemento': (data: ElementId) => void;
  'apagar-tudo': () => void;
}

// Inter-server events (empty for now)
export interface InterServerEvents {}

// Socket data
export interface SocketData {
  userId: string;
}

// Typed socket and server
export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
