import { SketchModel } from 'noya-sketch-model';
import { isWithinRectRange } from '../../infer/score';
import {
  buttonSymbolId,
  cardSymbolId,
  imageSymbolId,
  textSymbolId,
  tileCardSymbolId,
} from '../symbolIds';

export const cardSymbol = SketchModel.symbolMaster({
  symbolID: cardSymbolId,
  name: 'Card',
  blockDefinition: {
    hashtags: [],
    isComposedBlock: true,
    infer: ({ frame }) => {
      return Math.max(
        isWithinRectRange({
          rect: frame,
          minWidth: 200,
          minHeight: 250,
          maxWidth: 300,
          maxHeight: 400,
        })
          ? 1
          : 0,
        0.1,
      );
    },
  },
  defaultBlockText: '#flex-col #bg-white #p-4 #shadow #rounded-md',
  layers: [
    SketchModel.symbolInstance({
      do_objectID: '66a7337d-3e71-48de-b415-7d1551cd7be1',
      symbolID: imageSymbolId,
      blockText: 'landscape #rounded-lg #flex-1',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'f7a4bcee-9e41-455a-b29e-7ba3598eeb26',
      symbolID: textSymbolId,
      // symbolID: heading5SymbolId,
      blockText: 'News #mt-4',
    }),
    // SketchModel.symbolInstance({
    //   do_objectID: 'f5b4c896-fd40-4141-999e-90eef2c0a8f3',
    //   symbolID: textSymbolId,
    //   blockText: 'Here you can explore the latest news and information. #mt-1',
    // }),
  ],
});

export const tileCardSymbol = SketchModel.symbolMaster({
  symbolID: tileCardSymbolId,
  name: 'TileCard',
  defaultBlockText: '#flex-col #bg-blue-50 #p-6 #left',
  blockDefinition: {
    hashtags: [],
    isComposedBlock: true,
    infer: ({ frame }) => {
      return Math.max(
        isWithinRectRange({
          rect: frame,
          minWidth: 200,
          minHeight: 200,
          maxWidth: 250,
          maxHeight: 250,
        })
          ? 1.2
          : 0,
        0.1,
      );
    },
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: '2894cbbb-a257-4372-ad17-50db6faf75a3',
      symbolID: textSymbolId,
      blockText: 'Services',
    }),
    SketchModel.symbolInstance({
      do_objectID: '91514627-b323-457e-bf05-228c5a96830d',
      symbolID: textSymbolId,
      // symbolID: heading5SymbolId,
      blockText: 'How we can help your business. #flex-1 #mt-1',
    }),
    SketchModel.symbolInstance({
      do_objectID: '2b211bc6-86e0-4f93-8e14-514ae026afa6',
      symbolID: buttonSymbolId,
      blockText: 'Learn more #dark',
    }),
  ],
});
