import cloneDeep from 'lodash/cloneDeep';
import { NoyaDiff } from './types';

type Action = [
  type: 'updateTextValue',
  options: { path: string[]; value: string },
];

export function diffReducer(
  diff: NoyaDiff | undefined,
  action: Action,
): NoyaDiff {
  switch (action[0]) {
    case 'updateTextValue': {
      const [, { path, value }] = action;

      const newDiff: NoyaDiff = {
        ...diff,
        items: [
          ...cloneDeep(diff?.items ?? []).filter(
            (item) => item.path.join('/') !== path.join('/'),
          ),
          {
            path,
            textValue: value,
          },
        ],
      };

      return newDiff;
    }
  }
}
