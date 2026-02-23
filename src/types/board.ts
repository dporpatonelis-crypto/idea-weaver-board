export interface BoardCard {
  id: string;
  title: string;
  description: string;
  type: 'suspect' | 'evidence' | 'note';
  imageUrl?: string;
  x: number;
  y: number;
  rotation: number;
}

export type ConnectionType = 'agreement' | 'evolution' | 'disagreement';

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: ConnectionType;
  label?: string;
}
