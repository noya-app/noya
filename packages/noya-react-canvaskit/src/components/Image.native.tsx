import React, { memo } from 'react';

// TODO: move to shared directory f.e. PropTypes
// To avoid doubling the type
interface ImageProps {}

const Image: React.FC<ImageProps> = (props) => {
  return null;
};

export default memo(Image);
