import React, { memo } from 'react';

// TODO: move to shared directory f.e. PropTypes
// To avoid doubling the type
interface TextProps {}

const Text: React.FC<TextProps> = (props) => {
  return null;
};

export default memo(Text);
