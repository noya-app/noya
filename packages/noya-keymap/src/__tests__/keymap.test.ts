/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { KeyBinding, buildKeymap, Command } from '..';
import { getCurrentPlatform } from '../platform';

test('determines the platform name', () => {
  const binding: KeyBinding = {
    key: 'Ctrl-Shift-d',
    run: jest.fn(),
    scope: 'foo bar',
  };

  console.log(buildKeymap([binding], 'mac'));
});
