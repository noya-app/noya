import { Base64 } from '../index';

const CHECKERED_BACKGROUND = `iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAQMAAADaua+7AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABNJREFUCNdjYOD/TxL+/4GBFAwAvMsj3bQ3H74AAAAASUVORK5CYII=`;

test('symmetric serialization', () => {
  const decoded = Base64.decode(CHECKERED_BACKGROUND);
  const reencoded = Base64.encode(decoded);
  expect(CHECKERED_BACKGROUND === reencoded).toEqual(true);
});
