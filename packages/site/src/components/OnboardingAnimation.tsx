import React from 'react';

export function OnboardingAnimation({ src }: { src: string }) {
  return (
    <img
      alt=""
      src={src}
      style={{
        marginTop: '10px',
        objectFit: 'cover',
        width: 280,
        height: 180,
        outline: `1px solid #eee`,
        outlineOffset: -1,
      }}
    />
  );
}
