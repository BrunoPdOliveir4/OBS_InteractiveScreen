export type ElementType = 'texto' | 'imagem' | 'video';

export interface BaseElement {
  id: string;
  type: ElementType;
  content: string;
  left?: number;
  top?: number;
  width: number;
  height: number;
}

export interface TextElement extends BaseElement {
  type: 'texto';
  color?: string;
  fontSize?: string;
  fontFamily?: string;
}

export interface ImageElement extends BaseElement {
  type: 'imagem';
}

export interface VideoElement extends BaseElement {
  type: 'video';
}

export type Element = TextElement | ImageElement | VideoElement;

export interface ElementPosition {
  id: string;
  left: number;
  top: number;
}

export interface ElementSize {
  id: string;
  width: number;
  height: number;
}

export interface TextElementUpdate {
  id: string;
  content: string;
  color: string;
  size: string;
  font: string;
}

export interface ElementId {
  id: string;
}

export interface DrawingPoint {
  x: number;
  y: number;
}
