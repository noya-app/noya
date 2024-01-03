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
        backgroundColor: lightTheme.colors.thumbnailBackground,
        backgroundSize: `${Math.round(size.width / 4)}px ${Math.round(
          size.height / 4,
        )}px`,
        backgroundPosition: position,
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url(${NOYA_HOST}/api/files/${fileId}.png?params[component]=${encodeURIComponent(
          component.componentID,
        )}&params[library]=thumbnail&width=${size.width}&height=${
          size.height
        }&deviceScaleFactor=1)`,
      }}
    >
      {(position === 'top' || position === 'bottom') && (
        <div
          style={{
            width: '100%',
            height: '100%',
            background:
              position === 'top'
                ? 'linear-gradient(rgba(240, 240, 242, 0) 80%, rgb(240, 240, 242) 98%)'
                : 'linear-gradient(rgb(240, 240, 242) 2%, rgba(240, 240, 242, 0) 20%)',
          }}
        />
      )}
    </div>
  );
});
