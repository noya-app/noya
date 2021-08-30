import { debugDescription, SketchModel } from 'noya-sketch-model';
import {
  fromTextSpans,
  toTextSpans,
  replaceTextInRange,
  setAttributesInRange,
  getAttributesInRange,
} from '../attributedStringSelectors';
import { getEncodedStringAttributes } from '../textStyleSelectors';

const empty = SketchModel.attributedString({
  string: '',
  attributes: [],
});

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

// Abbreviated to keep `replaceTextInRange` calls on one line
const attrs = getEncodedStringAttributes(undefined);

describe('replace text', () => {
  describe('remove', () => {
    test('one attribute at start', () => {
      const updated = replaceTextInRange(hello, [0, 2], '', attrs);

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('one attribute in middle', () => {
      const updated = replaceTextInRange(hello, [2, 3], '', attrs);

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('one attribute at end', () => {
      const updated = replaceTextInRange(hello, [3, 5], '', attrs);

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('multiple attributes at start', () => {
      const updated = replaceTextInRange(helloWorld, [0, 2], '', attrs);

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('multiple attributes in middle', () => {
      const updated = replaceTextInRange(helloWorld, [3, 7], '', attrs);

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('multiple attributes at end', () => {
      const updated = replaceTextInRange(helloWorld, [7, 10], '', attrs);

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('spanning entire attributes', () => {
      const updated = replaceTextInRange(helloWorld12345, [3, 12], '', attrs);

      expect(debugDescription([helloWorld12345, updated])).toMatchSnapshot();
    });

    test('reversed range', () => {
      const updated = replaceTextInRange(hello, [2, 0], '', attrs);

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });
  });

  describe('insert', () => {
    test('into empty string', () => {
      const updated = replaceTextInRange(empty, [0, 0], '++', attrs);

      expect(debugDescription([empty, updated])).toMatchSnapshot();
    });

    test('one attribute at start', () => {
      const updated = replaceTextInRange(hello, [0, 2], '++', attrs);

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('one attribute in middle', () => {
      const updated = replaceTextInRange(hello, [2, 3], '++', attrs);

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('one attribute at end', () => {
      const updated = replaceTextInRange(hello, [3, 5], '++', attrs);

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });

    test('multiple attributes at start', () => {
      const updated = replaceTextInRange(helloWorld, [0, 2], '++', attrs);

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('multiple attributes in middle', () => {
      const updated = replaceTextInRange(helloWorld, [3, 7], '++', attrs);

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('multiple attributes at end', () => {
      const updated = replaceTextInRange(helloWorld, [7, 10], '++', attrs);

      expect(debugDescription([helloWorld, updated])).toMatchSnapshot();
    });

    test('spanning entire attributes', () => {
      const updated = replaceTextInRange(helloWorld12345, [3, 12], '++', attrs);

      expect(debugDescription([helloWorld12345, updated])).toMatchSnapshot();
    });

    test('beyond current string', () => {
      const updated = replaceTextInRange(hello, [10, 10], '++', attrs);

      expect(debugDescription([hello, updated])).toMatchSnapshot();
    });
  });
});

describe('set attributes', () => {
  const attrs = {
    MSAttributedStringColorAttribute: SketchModel.WHITE,
  };
  const options = {
    attributedStringColors: true,
  };

  test('into empty string', () => {
    const updated = setAttributesInRange(empty, [0, 0], attrs);

    expect(debugDescription([empty, updated], options)).toMatchSnapshot();
  });

  test('one attribute at start', () => {
    const updated = setAttributesInRange(hello, [0, 2], attrs);

    expect(debugDescription([hello, updated], options)).toMatchSnapshot();
  });

  test('one attribute in middle', () => {
    const updated = setAttributesInRange(hello, [2, 3], attrs);

    expect(debugDescription([hello, updated], options)).toMatchSnapshot();
  });

  test('one attribute at end', () => {
    const updated = setAttributesInRange(hello, [3, 5], attrs);

    expect(debugDescription([hello, updated], options)).toMatchSnapshot();
  });

  test('multiple attributes at start', () => {
    const updated = setAttributesInRange(helloWorld, [0, 2], attrs);

    expect(debugDescription([helloWorld, updated], options)).toMatchSnapshot();
  });

  test('multiple attributes in middle', () => {
    const updated = setAttributesInRange(helloWorld, [3, 7], attrs);

    expect(debugDescription([helloWorld, updated], options)).toMatchSnapshot();
  });

  test('multiple attributes at end', () => {
    const updated = setAttributesInRange(helloWorld, [7, 10], attrs);

    expect(debugDescription([helloWorld, updated], options)).toMatchSnapshot();
  });

  test('spanning entire attributes', () => {
    const updated = setAttributesInRange(helloWorld12345, [3, 12], attrs);

    expect(
      debugDescription([helloWorld12345, updated], options),
    ).toMatchSnapshot();
  });
});

describe('get attributes', () => {
  test('into empty string', () => {
    const updated = getAttributesInRange(empty, [0, 0]);

    expect(updated).toEqual([]);
  });

  test('one attribute at start', () => {
    const updated = getAttributesInRange(hello, [0, 2]);

    expect(updated).toEqual(hello.attributes);
  });

  test('one attribute in middle', () => {
    const updated = getAttributesInRange(hello, [2, 3]);

    expect(updated).toEqual(hello.attributes);
  });

  test('one attribute at end', () => {
    const updated = getAttributesInRange(hello, [3, 5]);

    expect(updated).toEqual(hello.attributes);
  });

  test('multiple attributes at start', () => {
    const updated = getAttributesInRange(helloWorld, [0, 2]);

    expect(updated).toEqual(helloWorld.attributes.slice(0, 1));
  });

  test('multiple attributes in middle', () => {
    const updated = getAttributesInRange(helloWorld, [3, 7]);

    expect(updated).toEqual(helloWorld.attributes);
  });

  test('multiple attributes at end', () => {
    const updated = getAttributesInRange(helloWorld, [7, 10]);

    expect(updated).toEqual(helloWorld.attributes.slice(1));
  });

  test('spanning entire attributes', () => {
    const updated = getAttributesInRange(helloWorld12345, [3, 12]);

    expect(updated).toEqual(helloWorld12345.attributes);
  });

  test('empty cursor at start', () => {
    const updated = getAttributesInRange(helloWorld, [0, 0]);

    expect(updated).toEqual(helloWorld.attributes.slice(0, 1));
  });

  test('empty cursor in middle', () => {
    const updated = getAttributesInRange(helloWorld, [5, 5]);

    expect(updated).toEqual(helloWorld.attributes.slice(1));
  });

  test('empty cursor at end', () => {
    const updated = getAttributesInRange(helloWorld, [10, 10]);

    expect(updated).toEqual(helloWorld.attributes.slice(1));
  });
});
