export type IconName = 'estrela' | 'foguete' | 'coracao' | 'lampada' | 'grafico' | 'escudo';

export interface Benefit {
  icon: IconName;
  title: string;
  description: string;
}

export interface InfographicData {
  title: string;
  benefits: Benefit[];
  imageUrl?: string;
}

export enum InputMode {
  AI = 'AI',
  MANUAL = 'MANUAL'
}