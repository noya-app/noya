import { createCustomTesters, dragDraw } from './utils';

const { expectToMatchScreenShot } = createCustomTesters(__filename);

describe('Example', () => {
  it('Draws a rectangle', async () => {
    await element(by.text('Add Rectangle')).tap();

    await dragDraw(
      element(by.id('Canvas')),
      { x: 0.1, y: 0.1 },
      { x: 0.9, y: 0.9 },
    );

    await expectToMatchScreenShot('basic');
  });
});
