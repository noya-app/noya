import { lightTheme } from '@noya-app/noya-designsystem';
import { Size } from '@noya-app/noya-geometry';
import { NoyaComponent } from 'noya-component';
import React, { memo } from 'react';
import { NOYA_HOST } from '../utils/noyaClient';

type Props = {
  fileId: string;
  component: NoyaComponent;
  size?: Size;
};

export const defaultThumbnailSize = { width: 832, height: 468 };

export const DSComponentThumbnail = memo(function DSComponentThumbnail({
  fileId,
  component,
}: Props) {
  const size = component.thumbnail?.size ?? defaultThumbnailSize;
  const position = component.thumbnail?.position ?? 'center';

  return (
    <div
      key={`${component.id}-${size.width}-${size.height}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: lightTheme.colors.thumbnailBackground,
        overflow: 'hidden',
      }}
    >
      <img
        src={`${NOYA_HOST}/api/files/${fileId}.png?params[component]=${encodeURIComponent(
          component.componentID,
        )}&params[library]=thumbnail&width=${size.width}&height=${
          size.height
        }&deviceScaleFactor=1`}
        style={{
          width: `${Math.round(size.width / 4)}px`,
          height: `${Math.round(size.height / 4)}px`,
          position: 'absolute',
          left: '50%',
          marginLeft: `-${Math.round(size.width / 8)}px`, // Half of the width
          top:
            position === 'top'
              ? '20px'
              : position === 'bottom'
              ? 'initial'
              : '50%',
          bottom: position === 'bottom' ? '20px' : 'initial',
          marginTop:
            position === 'top' || position === 'bottom'
              ? 'initial'
              : `-${Math.round(size.height / 8)}px`, // Half of the height, only if not top or bottom
          filter: 'drop-shadow(0 4px 28px #D3CEED66)',
        }}
        alt=""
      />
    </div>
  );
});
