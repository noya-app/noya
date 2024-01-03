import { SketchModel } from '@noya-app/noya-sketch-model';
import { Overrides } from 'noya-state';
import { isWithinRectRange } from '../../infer/score';
import {
  boxSymbolId,
  featureItemSymbolId,
  featureRowSymbolId,
  featureSectionSymbolId,
  linkSymbolId,
  tagSymbolId,
  textSymbolId,
} from '../symbolIds';

const featureItemTitleLayerId = '91514627-b323-457e-bf05-228c5a96830d';

export const featureItemDetailsSymbol = SketchModel.symbolMaster({
  symbolID: '363aea13-2245-4cac-a07d-4be7c64c7a29',
  name: 'Feature Item Details',
  blockDefinition: {
    placeholderParameters: ['flex-1', 'flex-col', 'gap-2'],
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: featureItemTitleLayerId,
      symbolID: textSymbolId,
      blockText: 'Advanced Security',
      blockParameters: ['h5', 'leading-8'],
    }),
    SketchModel.symbolInstance({
      do_objectID: '2b211bc6-86e0-4f93-8e14-514ae026afa6',
      symbolID: textSymbolId,
      blockText:
        'We offer state-of-the-art security features such as end-to-end encryption in order to better protect your data.',
    }),
    SketchModel.symbolInstance({
      do_objectID: '74b18902-9928-4a56-b2b3-f29c87f0e690',
      symbolID: linkSymbolId,
      blockText: 'Learn more',
      blockParameters: ['text-blue-500', 'icon-arrow-forward', 'mt-2'],
    }),
  ],
});

const featureItemIconLayerId = '2894cbbb-a257-4372-ad17-50db6faf75a3';
const featureItemDetailsLayerId = '91514627-b323-457e-bf05-228c5a96830d';

export const featureItemSymbol = SketchModel.symbolMaster({
  symbolID: featureItemSymbolId,
  name: 'Feature Item',
  blockDefinition: {
    placeholderParameters: ['flex-row', 'gap-4'],
    infer: ({ frame }) => {
      return Math.max(
        isWithinRectRange({
          rect: frame,
          minWidth: 200,
          maxWidth: 600,
          minHeight: 150,
          maxHeight: 300,
        }) && frame.width > frame.height
          ? 0.5
          : 0,
        0,
      );
    },
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: featureItemIconLayerId,
      symbolID: boxSymbolId,
      // symbolID: iconSymbolId,
      blockParameters: [
        'bg-blue-500',
        'rounded',
        'fill-white',
        'p-1',
        'w-8',
        'h-8',
      ],
    }),
    SketchModel.symbolInstance({
      do_objectID: featureItemDetailsLayerId,
      symbolID: featureItemDetailsSymbol.symbolID,
    }),
  ],
});

export const featureRowSymbol = SketchModel.symbolMaster({
  symbolID: featureRowSymbolId,
  name: 'Feature Row',
  blockDefinition: {
    placeholderParameters: ['flex-row', 'gap-8', 'mt-24'],
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: 'dd07568f-9508-40bd-b92d-688b177f868c',
      symbolID: featureItemSymbolId,
    }),
    SketchModel.symbolInstance({
      do_objectID: '612bafa1-a6a6-48d5-9b0b-644044fae76e',
      symbolID: featureItemSymbolId,
      overrideValues: [
        SketchModel.overrideValue({
          overrideName: Overrides.encodeName(
            [featureItemIconLayerId],
            'blockText',
          ),
          value: 'plug',
        }),
        SketchModel.overrideValue({
          overrideName: Overrides.encodeName(
            [featureItemDetailsLayerId, featureItemTitleLayerId],
            'blockText',
          ),
          value: 'Plugins',
        }),
      ],
    }),
    SketchModel.symbolInstance({
      do_objectID: '514d282e-c9bd-44a8-a506-bdf8be104665',
      symbolID: featureItemSymbolId,
    }),
  ],
});

export const featureSectionSymbol = SketchModel.symbolMaster({
  symbolID: featureSectionSymbolId,
  name: 'Feature Section',
  blockDefinition: {
    placeholderParameters: ['flex-col', 'items-center', 'px-20'],
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: '1dea1c4d-f1bd-473b-a1aa-a0c6a1481ae2',
      symbolID: tagSymbolId,
      blockText: 'Highlighted Features',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'ef2d5b26-aa1c-40d3-8bab-37c10bccc5cb',
      symbolID: textSymbolId,
      blockText: 'From idea to launch',
      blockParameters: ['h2', 'mt-2'],
    }),
    SketchModel.symbolInstance({
      do_objectID: 'aa722c35-9ba4-4bf3-a5d0-f7d17f02c361',
      symbolID: textSymbolId,
      blockText: "Build the business you've always wanted.",
      blockParameters: ['h5', 'mt-2'],
    }),
    SketchModel.symbolInstance({
      do_objectID: '75f1af59-564e-484a-8b46-34a18d2d3054',
      symbolID: featureRowSymbolId,
    }),
  ],
});
