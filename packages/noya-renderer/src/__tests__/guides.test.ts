import { getGuides } from '../guides';

test('create guides', () => {
  expect(
    getGuides(
      '-',
      'x',
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 200, y: 0, width: 100, height: 100 },
    ),
  ).toMatchSnapshot();
});
