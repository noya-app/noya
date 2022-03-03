export interface ButtonProps {
  onPress: () => void | Promise<void>;
  label?: string;
  icon?: string;
  active?: boolean;
}
