import Sketch from 'noya-file-format';
import { uuid } from 'noya-utils';

function createSharedObjectContainer<T extends string>(_class: T) {
  return {
    _class,
    do_objectID: uuid(),
    objects: [],
  };
}

export function createDocument(): Sketch.Document {
  return {
    _class: 'document',
    do_objectID: uuid(),
    documentState: { _class: 'documentState' },
    colorSpace: 0,
    currentPageIndex: 0,
    assets: {
      _class: 'assetCollection',
      do_objectID: uuid(),
      images: [],
      colorAssets: [],
      exportPresets: [],
      gradientAssets: [],
      imageCollection: { _class: 'imageCollection', images: {} },
      colors: [],
      gradients: [],
    },
    fontReferences: [],
    foreignLayerStyles: [],
    foreignSwatches: [],
    foreignSymbols: [],
    foreignTextStyles: [],
    layerStyles: createSharedObjectContainer('sharedStyleContainer'),
    layerSymbols: createSharedObjectContainer('symbolContainer') as any, // Legacy, not used in new docs
    layerTextStyles: createSharedObjectContainer('sharedTextStyleContainer'),
    sharedSwatches: createSharedObjectContainer('swatchContainer'),
    pages: [],
  };
}
