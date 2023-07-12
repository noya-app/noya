import { SketchModel } from 'noya-sketch-model';
import { isWithinRectRange } from '../infer/score';
import { buttonSymbolId, heroSymbolV2Id } from './symbolIds';

// const heroSymbolIds = [heroSymbolV2Id, heroWithImageSymbolId];

export const heroButtonRowSymbol = SketchModel.symbolMaster({
  symbolID: '83d2fdeb-6f4d-4948-a677-fe1f2aac64d5',
  name: 'Hero Button Row',
  blockDefinition: {
    isPassthrough: true,
    placeholderParameters: ['flex-row', 'items-center', 'gap-6', 'mt-4'],
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: '6b386c69-d6cf-4c2f-ae06-c92af43268d5',
      symbolID: buttonSymbolId,
      blockText: 'Get started',
    }),
    // SketchModel.symbolInstance({
    //   do_objectID: 'eee85c94-7361-4bcf-8afb-f59c6e8661f7',
    //   symbolID: linkSymbolId,
    //   blockText: 'Learn more #no-underline #icon-arrow-forward',
    //   isVisible: false,
    // }),
  ],
});

export const heroHeadlineStackSymbol = SketchModel.symbolMaster({
  symbolID: '511cf6e2-b92b-45a3-a239-b13e9dbbfe9f',
  name: 'Hero Headline Stack',
  blockDefinition: {
    isPassthrough: true,
    placeholderParameters: ['flex-col', 'items-inherit'],
  },
  layers: [
    // SketchModel.symbolInstance({
    //   do_objectID: '1dea1c4d-f1bd-473b-a1aa-a0c6a1481ae2',
    //   symbolID: tagSymbolId,
    //   blockText: 'The future is here',
    // }),
    // SketchModel.symbolInstance({
    //   do_objectID: 'ef2d5b26-aa1c-40d3-8bab-37c10bccc5cb',
    //   symbolID: heading1SymbolId,
    //   blockText: 'Create, iterate, inspire.',
    // }),
  ],
});

export const heroSymbolX = SketchModel.symbolMaster({
  symbolID: heroSymbolV2Id,
  name: 'Hero',
  blockDefinition: {
    placeholderParameters: ['flex-1', 'flex-col', 'center', 'p-4', 'gap-3'],
    stylePresets: [
      { parameters: ['flex-1', 'flex-col', 'p-4', 'gap-3', 'center'] },
      { parameters: ['flex-1', 'flex-col', 'p-4', 'gap-3', 'left'] },
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
      do_objectID: 'd6593501-b089-4390-bbe2-fb10afb5df5a',
      symbolID: heroHeadlineStackSymbol.symbolID,
      blockText: '',
    }),
    // SketchModel.symbolInstance({
    //   do_objectID: 'aa722c35-9ba4-4bf3-a5d0-f7d17f02c361',
    //   symbolID: heading4SymbolId,
    //   blockText: 'Turn great ideas into new possibilities.',
    // }),
    SketchModel.symbolInstance({
      do_objectID: '83d2fdeb-6f4d-4948-a677-fe1f2aac64d5',
      symbolID: heroButtonRowSymbol.symbolID,
      blockText: '',
    }),
  ],
});
