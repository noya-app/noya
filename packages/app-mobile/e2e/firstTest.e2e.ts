import { expect } from 'detox';
import { createCustomTesters } from './utils';

const { expectToMatchScreenShot } = createCustomTesters(__filename);

describe('Example', () => {
  it('should show add rect button', async () => {
    await expect(element(by.text('Add Rectangle'))).toBeVisible();

    await expectToMatchScreenShot('basic');
  });
});
