import type { DrawingProps } from '@shopify/react-native-skia';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      skDrawing: DrawingProps<any>;
    }
  }
}
