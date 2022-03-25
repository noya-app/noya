import { RefObject } from 'react';
import { MeasureOnSuccessCallback } from 'react-native';

interface Measureable {
  measure: (callback: MeasureOnSuccessCallback) => void;
}

interface Measurement {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

export default async function measureAsync(
  ref: RefObject<Measureable>,
): Promise<Measurement | void> {
  return new Promise((resolve) => {
    if (!ref.current) {
      resolve();
      return;
    }

    ref.current.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number,
      ) => {
        resolve({ x, y, width, height, pageX, pageY });
      },
    );
  });
}
