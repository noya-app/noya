import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  PropsWithChildren,
} from 'react';
import styled from 'styled-components';
import { LayoutChangeEvent, View } from 'react-native';

type AspectRatioProps = PropsWithChildren<{
  ratio: number;
}>;

const Ratio = styled(View)<{ height: number }>(({ height }) => ({ height }));

function AspectRatio({ ratio, children }: AspectRatioProps) {
  const [width, setWidth] = useState<number>(0);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  const height = useMemo(() => width * (1 / ratio), [width, ratio]);

  return (
    <View onLayout={onLayout}>
      <Ratio height={height}>{children}</Ratio>
    </View>
  );
}

export default memo(AspectRatio);
