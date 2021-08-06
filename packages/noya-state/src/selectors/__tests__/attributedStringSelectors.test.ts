import { debugDescription, SketchModel } from 'noya-sketch-model';
import {
  fromTextSpans,
  toTextSpans,
  replaceTextInRange,
} from '../attributedStringSelectors';

const hello = SketchModel.attributedString({
  string: 'hello',
  attributes: [
    SketchModel.stringAttribute({
      location: 0,
      length: 5,
    }),
  ],
});

const helloWorld = SketchModel.attributedString({
  string: 'helloworld',
  attributes: [
    SketchModel.stringAttribute({
      location: 0,
      length: 5,
    }),
    SketchModel.stringAttribute({
      location: 5,
      length: 5,
    }),
  ],
});

const helloWorld12345 = SketchModel.attributedString({
  string: 'helloworld12345',
  attributes: [
    SketchModel.stringAttribute({
      location: 0,
      length: 5,
    }),
    SketchModel.stringAttribute({
      location: 5,
      length: 5,
    }),
    SketchModel.stringAttribute({
      location: 10,
      length: 5,
    }),
  ],
});

test('convert to and from text spans', () => {
  const spans = toTextSpans(helloWorld);
  const attributedString = fromTextSpans(spans);

  expect(helloWorld).toEqual(attributedString);
});

describe('replace text', () => {
  describe('remove', () => {
    test('one attribute at start', () => {
      const updated = replaceTextInRange(hello, [0, 2], '');

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('one attribute in middle', () => {
      const updated = replaceTextInRange(hello, [2, 3], '');

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('one attribute at end', () => {
      const updated = replaceTextInRange(hello, [3, 5], '');

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('multiple attributes at start', () => {
      const updated = replaceTextInRange(helloWorld, [0, 2], '');

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('multiple attributes in middle', () => {
      const updated = replaceTextInRange(helloWorld, [3, 7], '');

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('multiple attributes at end', () => {
      const updated = replaceTextInRange(helloWorld, [7, 10], '');

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('spanning entire attributes', () => {
      const updated = replaceTextInRange(helloWorld12345, [3, 12], '');

      expect(debugDescription([helloWorld12345, updated])).toMatchSnapshot();
    });
  });

  describe('insert', () => {
    test('one attribute at start', () => {
      const updated = replaceTextInRange(hello, [0, 2], '++');

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('one attribute in middle', () => {
      const updated = replaceTextInRange(hello, [2, 3], '++');

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('one attribute at end', () => {
      const updated = replaceTextInRange(hello, [3, 5], '++');

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('multiple attributes at start', () => {
      const updated = replaceTextInRange(helloWorld, [0, 2], '++');

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('multiple attributes in middle', () => {
      const updated = replaceTextInRange(helloWorld, [3, 7], '++');

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('multiple attributes at end', () => {
      const updated = replaceTextInRange(helloWorld, [7, 10], '++');

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('spanning entire attributes', () => {
      const updated = replaceTextInRange(helloWorld12345, [3, 12], '++');

      expect(debugDescription([helloWorld12345, updated])).toMatchSnapshot();
    });
  });
});
