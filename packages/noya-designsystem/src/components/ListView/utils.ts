import type { ListRowMarginType } from './types';

export function getPositionMargin(marginType: ListRowMarginType) {
  return {
    top: marginType === 'top' || marginType === 'vertical' ? 8 : 0,
    bottom: marginType === 'bottom' || marginType === 'vertical' ? 8 : 0,
  };
}
