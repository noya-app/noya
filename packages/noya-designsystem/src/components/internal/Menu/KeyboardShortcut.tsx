import { memo } from 'react';
import styled from 'styled-components';

import { useDesignSystemConfiguration } from 'noya-ui';
import { getShortcutDisplayParts } from 'noya-keymap';
import withSeparatorElements from '../../../utils/withSeparatorElements';

const ShortcutElement = styled.kbd<{ fixedWidth?: boolean }>(
  ({ theme, fixedWidth }) => ({
    ...theme.textStyles.small,
    color: theme.colors.textDisabled,
    ...(fixedWidth && {
      width: '0.9rem',
      textAlign: 'center',
    }),
  }),
);

function KeyboardShortcut({ shortcut }: { shortcut: string }) {
  const platform = useDesignSystemConfiguration().platform;

  const { keys, separator } = getShortcutDisplayParts(shortcut, platform);

  const keyElements = keys.map((key) => (
    <ShortcutElement
      key={key}
      fixedWidth={platform === 'macos' && key.length === 1}
    >
      {key}
    </ShortcutElement>
  ));

  return (
    <>
      {separator
        ? withSeparatorElements(
            keyElements,
            <ShortcutElement>{separator}</ShortcutElement>,
          )
        : keyElements}
    </>
  );
}

export default memo(KeyboardShortcut);
