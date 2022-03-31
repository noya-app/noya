export interface Interaction {
  left: number;
  top: number;
}

export interface InteractiveProps {
  onMove: (interaction: Interaction) => void;
  onKey?: (offset: Interaction) => void;
  onClick?: (interaction: Interaction | number) => void;
  onDelete?: () => void;
  onClickPointer?: (index: number) => void;
  children: React.ReactNode;
}

export interface PointerProps {
  top?: number;
  left: number;
  index?: number;
  selected?: boolean;
  onClick?: () => void;
}
