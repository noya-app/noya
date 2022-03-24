export interface SliderProps {
  id?: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
}
