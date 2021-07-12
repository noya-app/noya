import { setAutoFreeze } from 'immer';

setAutoFreeze(false);

export * as Overrides from './overrides';
export * as Layers from './layers';
export * as GroupLayouts from './groupLayouts';
export * as ExportOptions from './exportOptions';
export * as Selectors from './selectors/selectors';
export * as Models from './models';
export * as TextStyleSelectors from './selectors/textStyleSelectors';

export type { SelectedPoint } from './reducers/pointReducer';
export * from './reducers/workspaceReducer';
export * from './reducers/applicationReducer';
export * from './reducers/historyReducer';
export * from './reducers/interactionReducer';
export * from './types';

export type { SelectionType } from './utils/selection';

export * as Primitives from './primitives';
export * from './primitives';
export * from './selection';
export * from './checkeredBackground';
export * from './snapping';
