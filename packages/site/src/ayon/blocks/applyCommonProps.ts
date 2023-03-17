import { CommonProps } from '@noya-design-system/protocol';
import { BlockProps } from 'noya-state';

export function applyCommonProps(
  props: BlockProps,
): Pick<CommonProps, '_passthrough'> {
  return {
    _passthrough: {
      ...(props.dataSet && {
        key: props.dataSet.id,
        'data-noya-id': props.dataSet.id,
        'data-noya-parent-id': props.dataSet.parentId,
      }),
    },
  };
}
