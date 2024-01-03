import { SketchModel } from '@noya-app/noya-sketch-model';
import { isWithinRectRange } from '../../infer/score';
import {
  boxSymbolId,
  buttonSymbolId,
  heroSymbolId,
  heroSymbolV1Id,
  heroWithImageSymbolId,
  imageSymbolId,
  linkSymbolId,
  tagSymbolId,
  textSymbolId,
} from '../symbolIds';

// const heroSymbolIds = [heroSymbolV2Id, heroWithImageSymbolId];

export const heroSymbolV1 = SketchModel.symbolMaster({
  symbolID: heroSymbolV1Id,
  name: 'Hero V1 (update available)',
});

export const heroSymbol = SketchModel.symbolMaster({
  symbolID: heroSymbolId,
  name: 'Hero',
  blockDefinition: {
    placeholderParameters: ['flex-1', 'flex-col', 'center', 'p-4', 'gap-3'],
    stylePresets: [
      { parameters: ['flex-1', 'flex-col', 'p-4', 'gap-3', 'center'] },
      {
        parameters: [
          'flex-1',
          'flex-col',
          'px-20',
          'gap-3',
          'items-start',
          'justify-center',
        ],
      },
      { parameters: ['flex-1', 'flex-col', 'p-4', 'gap-3', 'dark'] },
    ],
    infer({ frame }) {
      return Math.max(
        isWithinRectRange({
          rect: frame,
          minWidth: 400,
          minHeight: 200,
          maxWidth: 2000,
          maxHeight: 550,
        }) && frame.y < 180
          ? 1
          : 0,
        0.1,
      );
    },
  },
  layers: [
    SketchModel.symbolInstance({
      symbolID: boxSymbolId,
      blockParameters: ['flex-col', 'items-inherit', 'gap-2'],
      overrideValues: [
        SketchModel.overrideValue({
          overrideName: 'layers',
          value: [
            SketchModel.symbolInstance({
              do_objectID: '1dea1c4d-f1bd-473b-a1aa-a0c6a1481ae2',
              symbolID: tagSymbolId,
              blockText: 'The future is here',
            }),
            SketchModel.symbolInstance({
              do_objectID: 'ef2d5b26-aa1c-40d3-8bab-37c10bccc5cb',
              symbolID: textSymbolId,
              blockText: 'Create, iterate, inspire.',
              blockParameters: ['h1'],
            }),
          ],
        }),
      ],
    }),
    SketchModel.symbolInstance({
      do_objectID: 'aa722c35-9ba4-4bf3-a5d0-f7d17f02c361',
      symbolID: textSymbolId,
      blockText: 'Turn great ideas into new possibilities.',
      blockParameters: ['h4'],
    }),
    SketchModel.symbolInstance({
      symbolID: boxSymbolId,
      do_objectID: '4483d3dc-5391-47c6-ab96-c99a23cb4293',
      blockParameters: ['flex-row', 'items-center', 'gap-6', 'mt-4'],
      overrideValues: [
        SketchModel.overrideValue({
          overrideName: 'layers',
          value: [
            SketchModel.symbolInstance({
              do_objectID: '6b386c69-d6cf-4c2f-ae06-c92af43268d5',
              symbolID: buttonSymbolId,
              blockText: 'Get started',
            }),
            SketchModel.symbolInstance({
              do_objectID: 'eee85c94-7361-4bcf-8afb-f59c6e8661f7',
              symbolID: linkSymbolId,
              blockText: 'Learn more',
              blockParameters: ['no-underline', 'icon-arrow-forward'],
            }),
          ],
        }),
      ],
    }),
  ],
});

export const heroWithImageSymbol = SketchModel.symbolMaster({
  symbolID: heroWithImageSymbolId,
  name: 'Hero with Image',
  blockDefinition: {
    placeholderParameters: ['flex-1', 'grid', 'grid-flow-col', 'auto-cols-fr'],
    infer: ({ frame }) => {
      // if (siblingBlocks.some((block) => heroSymbolIds.includes(block.symbolId))) {
      //   return 0;
      // }

      return Math.max(
        isWithinRectRange({
          rect: frame,
          minWidth: 1000,
          minHeight: 400,
          maxWidth: 2000,
          maxHeight: 800,
        }) && frame.y < 180
          ? 1.2
          : 0,
        0.1,
      );
    },
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: 'bc20968b-328a-4831-b242-ed0572e6459d',
      symbolID: heroSymbolId,
      blockParameters: [
        'flex-1',
        'flex-col',
        'center',
        'py-4',
        'px-20',
        'gap-3',
      ],
    }),
    SketchModel.symbolInstance({
      do_objectID: 'e65f7c76-ef83-4924-9545-3e50ac18b32a',
      symbolID: imageSymbolId,
      blockText: 'landscape',
      blockParameters: ['w-full', 'h-full'],
    }),
  ],
});
