import { Size } from 'noya-geometry';
import React, { memo } from 'react';
import { NOYA_HOST } from '../utils/noyaClient';
import { NoyaComponent } from './types';

type Props = {
  fileId: string;
  component: NoyaComponent;
  size?: Size;
};

export const defaultThumbnailSize = { width: 512, height: 288 };

export const DSComponentThumbnail = memo(function DSComponentThumbnail({
  fileId,
  component,
}: Props) {
  const size = component.thumbnail?.size ?? defaultThumbnailSize;

  return (
    <div
      key={`${component.id}-${size.width}-${size.height}`}
      style={{
        width: '100%',
        height: '100%',
        backgroundSize: `${size.width / 4}px ${size.height / 4}px`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url(${NOYA_HOST}/api/files/${fileId}.png?params[component]=${encodeURIComponent(
          component.componentID,
        )}&params[library]=thumbnail&width=${size.width}&height=${
          size.height
        }&deviceScaleFactor=1)`,
      }}
    />
  );
});
