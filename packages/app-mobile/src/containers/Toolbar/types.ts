export interface ToolbarItem {
  icon?: string;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  shortcut?: {
    cmd: string;
    title: string;
    menuName: string;
  };
}
