// These types propagate generics through memo and forwardRef to support generic components
//
// https://stackoverflow.com/questions/60386614/how-to-use-props-with-generics-with-react-memo/60389122#60389122
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref/58473012
declare module 'react' {
  function memo<A, B>(
    Component: (props: A) => B,
  ): (props: A) => ReactElement | null;

  function forwardRef<T, P = {}>(
    render: (props: P, ref: ForwardedRef<T>) => ReactElement | null,
  ): (props: P & RefAttributes<T>) => ReactElement | null;
}

// Theme
// Components
export * from './components/ActivityIndicator';
export * from './components/Avatar';
export * from './components/Button';
export * from './components/Chip';
export * from './components/ColorPicker';
export * from './components/ContextMenu';
export * from './components/Dialog';
export * from './components/Divider';
export * from './components/DropdownMenu';
export * from './components/FillInputField';
export * from './components/FillPreviewBackground';
export * from './components/GradientPicker';
export * from './components/Grid';
export * from './components/GridView';
export * from './components/IconButton';
export * from './components/InputField';
export * from './components/InputFieldWithCompletions';
export * from './components/Label';
export * from './components/LabeledElementView';
export * from './components/ListView';
export * from './components/Popover';
export * from './components/Progress';
export * from './components/RadioGroup';
export * from './components/ScrollArea';
export * from './components/Select';
export * from './components/Slider';
export * from './components/Sortable';
export type { RelativeDropPosition } from './components/Sortable';
export * from './components/Spacer';
export * from './components/Stack';
export * from './components/Switch';
export * from './components/Text';
export * from './components/Toast';
export * from './components/Tooltip';
export * from './components/TreeView';
export { KeyboardShortcut, SEPARATOR_ITEM } from './components/internal/Menu';
export type {
  ExtractMenuItemType,
  MenuItem,
  RegularMenuItem,
} from './components/internal/Menu';
export * from './contexts/DesignSystemConfiguration';
export * from './contexts/DialogContext';
// Contexts
export * from './contexts/GlobalInputBlurContext';
// Hooks
export * from './hooks/mergeEventHandlers';
export * from './hooks/useHover';
export * from './hooks/usePlatform';
export * from './mediaQuery';
export * from './theme';
export * as darkTheme from './theme/dark';
export * as lightTheme from './theme/light';
export * from './utils/createSectionedMenu';
export * from './utils/getGradientBackground';
export * from './utils/mouseEvent';
// Utils
export * from './utils/completions';
export * from './utils/fuzzyScorer';
export * from './utils/sketchColor';
export * from './utils/sketchPattern';
export { default as withSeparatorElements } from './utils/withSeparatorElements';
