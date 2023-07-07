import { SketchModel } from 'noya-sketch-model';
import { InferBlockProps, Overrides } from 'noya-state';
import { isWithinRectRange } from '../infer/score';
import { tailwindBlockClasses } from '../tailwind/tailwind';
import {
  avatarSymbolId,
  boxSymbolId,
  buttonSymbolId,
  cardSymbolId,
  checkboxSymbolId,
  featureItemSymbolId,
  featureRowSymbolId,
  featureSectionSymbolId,
  headerBarSymbolId,
  heading1SymbolId,
  heading2SymbolId,
  heading3SymbolId,
  heading4SymbolId,
  heading5SymbolId,
  heading6SymbolId,
  heroSymbolId,
  heroSymbolV2Id,
  heroWithImageSymbolId,
  iconSymbolId,
  imageSymbolId,
  inputSymbolId,
  linkSymbolId,
  radioSymbolId,
  selectSymbolId,
  sidebarSymbolId,
  signInSymbolId,
  spacerSymbolId,
  switchSymbolId,
  tableSymbolId,
  tagSymbolId,
  textSymbolId,
  textareaSymbolId,
  tileCardSymbolId,
  writeSymbolId,
} from './symbolIds';

const boxBlockHashtags = [
  'left',
  'center',
  'right',
  'dark',
  ...tailwindBlockClasses,
];

export const InferBlockMap: Record<string, (props: InferBlockProps) => number> =
  {};

export const buttonSymbol = SketchModel.symbolMaster({
  symbolID: buttonSymbolId,
  name: 'Button',
});

export const linkSymbol = SketchModel.symbolMaster({
  symbolID: linkSymbolId,
  name: 'Link',
});

export const tagSymbol = SketchModel.symbolMaster({
  symbolID: tagSymbolId,
  name: 'Tag',
});

export const avatarSymbol = SketchModel.symbolMaster({
  symbolID: avatarSymbolId,
  name: 'Avatar',
});

export const boxSymbol = SketchModel.symbolMaster({
  symbolID: boxSymbolId,
  name: 'Box',
});

export const checkboxSymbol = SketchModel.symbolMaster({
  symbolID: checkboxSymbolId,
  name: 'Checkbox',
});

export const inputSymbol = SketchModel.symbolMaster({
  symbolID: inputSymbolId,
  name: 'Input',
});

export const switchSymbol = SketchModel.symbolMaster({
  symbolID: switchSymbolId,
  name: 'Switch',
});

export const textSymbol = SketchModel.symbolMaster({
  symbolID: textSymbolId,
  name: 'Text',
});

export const imageSymbol = SketchModel.symbolMaster({
  symbolID: imageSymbolId,
  name: 'Image',
});

export const heading1Symbol = SketchModel.symbolMaster({
  symbolID: heading1SymbolId,
  name: 'Heading1',
});

export const heading2Symbol = SketchModel.symbolMaster({
  symbolID: heading2SymbolId,
  name: 'Heading2',
});

export const heading3Symbol = SketchModel.symbolMaster({
  symbolID: heading3SymbolId,
  name: 'Heading3',
});

export const heading4Symbol = SketchModel.symbolMaster({
  symbolID: heading4SymbolId,
  name: 'Heading4',
});

export const heading5Symbol = SketchModel.symbolMaster({
  symbolID: heading5SymbolId,
  name: 'Heading5',
});

export const heading6Symbol = SketchModel.symbolMaster({
  symbolID: heading6SymbolId,
  name: 'Heading6',
});

export const writeSymbol = SketchModel.symbolMaster({
  symbolID: writeSymbolId,
  name: 'Write',
});

export const headerBarSymbol = SketchModel.symbolMaster({
  symbolID: headerBarSymbolId,
  name: 'Navigation Bar',
});

export const heroSymbol = SketchModel.symbolMaster({
  symbolID: heroSymbolId,
  name: 'Hero V1 (update available)',
});

export const heroButtonRowSymbol = SketchModel.symbolMaster({
  symbolID: '83d2fdeb-6f4d-4948-a677-fe1f2aac64d5',
  name: 'Hero Button Row',
  defaultBlockText: '#bg-transparent #flex-row #items-center #gap-6 #mt-4',
  layers: [
    SketchModel.symbolInstance({
      do_objectID: '6b386c69-d6cf-4c2f-ae06-c92af43268d5',
      symbolID: buttonSymbolId,
      blockText: 'Get started',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'eee85c94-7361-4bcf-8afb-f59c6e8661f7',
      symbolID: linkSymbolId,
      blockText: 'Learn more #no-underline #icon-arrow-forward',
      isVisible: false,
    }),
  ],
});

export const heroHeadlineStackSymbol = SketchModel.symbolMaster({
  symbolID: '511cf6e2-b92b-45a3-a239-b13e9dbbfe9f',
  name: 'Hero Headline Stack',
  defaultBlockText: '#bg-transparent #flex-col #items-inherit',
  layers: [
    SketchModel.symbolInstance({
      do_objectID: '1dea1c4d-f1bd-473b-a1aa-a0c6a1481ae2',
      symbolID: tagSymbolId,
      blockText: 'The future is here',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'ef2d5b26-aa1c-40d3-8bab-37c10bccc5cb',
      symbolID: heading1SymbolId,
      blockText: 'Create, iterate, inspire.',
    }),
  ],
});

export const heroSymbolV2 = SketchModel.symbolMaster({
  symbolID: heroSymbolV2Id,
  name: 'Hero',
  defaultBlockText: '#flex-col #center #p-4 #gap-3',
  blockDefinition: {
    hashtags: boxBlockHashtags,
    isComposedBlock: true,
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: 'd6593501-b089-4390-bbe2-fb10afb5df5a',
      symbolID: heroHeadlineStackSymbol.symbolID,
      blockText: '',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'aa722c35-9ba4-4bf3-a5d0-f7d17f02c361',
      symbolID: heading4SymbolId,
      blockText: 'Turn great ideas into new possibilities.',
    }),
    SketchModel.symbolInstance({
      do_objectID: '83d2fdeb-6f4d-4948-a677-fe1f2aac64d5',
      symbolID: heroButtonRowSymbol.symbolID,
      blockText: '',
    }),
  ],
});

const heroSymbolIds = [heroSymbolV2Id, heroWithImageSymbolId];

InferBlockMap[heroSymbolV2Id] = ({ frame, blockText, siblingBlocks }) => {
  if (siblingBlocks.some((block) => heroSymbolIds.includes(block.symbolId))) {
    return 0;
  }

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
};

export const heroWithImageSymbol = SketchModel.symbolMaster({
  symbolID: heroWithImageSymbolId,
  name: 'Hero with Image',
  defaultBlockText: '#grid #grid-flow-col #auto-cols-fr	',
  blockDefinition: {
    hashtags: boxBlockHashtags,
    isComposedBlock: true,
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: 'bc20968b-328a-4831-b242-ed0572e6459d',
      symbolID: heroSymbolV2Id,
      blockText: '#left #px-20',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'e65f7c76-ef83-4924-9545-3e50ac18b32a',
      symbolID: imageSymbolId,
      blockText: 'landscape #w-full #h-full',
    }),
  ],
});

InferBlockMap[heroWithImageSymbolId] = ({
  frame,
  blockText,
  siblingBlocks,
}) => {
  if (siblingBlocks.some((block) => heroSymbolIds.includes(block.symbolId))) {
    return 0;
  }

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
};

export const signInSymbol = SketchModel.symbolMaster({
  symbolID: signInSymbolId,
  name: 'SignIn',
  defaultBlockText: '#flex-col #bg-transparent #p-4 #gap-1',
  layers: [
    SketchModel.symbolInstance({
      do_objectID: 'cc9e5670-301e-44ad-a06e-a8160926b7d2',
      symbolID: textSymbolId,
      blockText: 'Email',
    }),
    SketchModel.symbolInstance({
      do_objectID: '4e06e4bd-1ae9-4a8b-88c3-f6f525ac401b',
      symbolID: inputSymbolId,
      blockText: '',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'be955c6f-a85e-468c-8fba-f720a1ed4b81',
      symbolID: textSymbolId,
      blockText: 'Password #mt-2',
    }),
    SketchModel.symbolInstance({
      do_objectID: '28352154-ef46-4761-a498-92d697a737a8',
      symbolID: inputSymbolId,
      blockText: '',
    }),
    SketchModel.symbolInstance({
      do_objectID: '6fe57c3a-20f0-4999-b602-7531cf082d70',
      symbolID: spacerSymbolId,
      blockText: '#basis-2 #flex-auto',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'c211148b-3dd1-45a1-83f8-708e49a25d49',
      symbolID: buttonSymbolId,
      blockText: 'Sign In #primary',
    }),
  ],
});

InferBlockMap[signInSymbolId] = ({ frame, blockText, siblingBlocks }) => {
  if (siblingBlocks.find((block) => block.symbolId === signInSymbol.symbolID)) {
    return 0;
  }

  return 0.1;
};

export const cardSymbol = SketchModel.symbolMaster({
  symbolID: cardSymbolId,
  name: 'Card',
  blockDefinition: {
    hashtags: boxBlockHashtags,
    isComposedBlock: true,
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
      symbolID: heading5SymbolId,
      blockText: 'News #mt-4',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'f5b4c896-fd40-4141-999e-90eef2c0a8f3',
      symbolID: textSymbolId,
      blockText: 'Here you can explore the latest news and information. #mt-1',
    }),
  ],
});

InferBlockMap[cardSymbolId] = ({ frame, blockText, siblingBlocks }) => {
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
};

export const tileCardSymbol = SketchModel.symbolMaster({
  symbolID: tileCardSymbolId,
  name: 'TileCard',
  defaultBlockText: '#flex-col #bg-blue-50 #p-6 #left',
  blockDefinition: {
    hashtags: boxBlockHashtags,
    isComposedBlock: true,
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: '2894cbbb-a257-4372-ad17-50db6faf75a3',
      symbolID: textSymbolId,
      blockText: 'Services',
    }),
    SketchModel.symbolInstance({
      do_objectID: '91514627-b323-457e-bf05-228c5a96830d',
      symbolID: heading5SymbolId,
      blockText: 'How we can help your business. #flex-1 #mt-1',
    }),
    SketchModel.symbolInstance({
      do_objectID: '2b211bc6-86e0-4f93-8e14-514ae026afa6',
      symbolID: buttonSymbolId,
      blockText: 'Learn more #dark',
    }),
  ],
});

InferBlockMap[tileCardSymbolId] = ({ frame, blockText, siblingBlocks }) => {
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
};

export const iconSymbol = SketchModel.symbolMaster({
  symbolID: iconSymbolId,
  name: 'Icon',
});

export const sidebarSymbol = SketchModel.symbolMaster({
  symbolID: sidebarSymbolId,
  name: 'Sidebar',
});

export const tableSymbol = SketchModel.symbolMaster({
  symbolID: tableSymbolId,
  name: 'Table',
});

export const selectSymbol = SketchModel.symbolMaster({
  symbolID: selectSymbolId,
  name: 'Select',
});

export const radioSymbol = SketchModel.symbolMaster({
  symbolID: radioSymbolId,
  name: 'Radio',
});

export const textareaSymbol = SketchModel.symbolMaster({
  symbolID: textareaSymbolId,
  name: 'Textarea',
});

export const spacerSymbol = SketchModel.symbolMaster({
  symbolID: spacerSymbolId,
  name: 'Spacer',
});

const featureItemTitleLayerId = '91514627-b323-457e-bf05-228c5a96830d';

export const featureItemDetailsSymbol = SketchModel.symbolMaster({
  symbolID: '363aea13-2245-4cac-a07d-4be7c64c7a29',
  name: 'FeatureItemDetails',
  defaultBlockText: '#flex-1 #flex-col #gap-2',
  layers: [
    SketchModel.symbolInstance({
      do_objectID: featureItemTitleLayerId,
      symbolID: heading5SymbolId,
      blockText: 'Advanced Security #leading-8',
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
      blockText: 'Learn more #text-blue-500 #icon-arrow-forward #mt-2',
    }),
  ],
});

const featureItemIconLayerId = '2894cbbb-a257-4372-ad17-50db6faf75a3';
const featureItemDetailsLayerId = '91514627-b323-457e-bf05-228c5a96830d';

export const featureItemSymbol = SketchModel.symbolMaster({
  symbolID: featureItemSymbolId,
  name: 'Feature Item',
  defaultBlockText: '#flex-row #gap-4',
  blockDefinition: {
    hashtags: boxBlockHashtags,
    isComposedBlock: true,
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: featureItemIconLayerId,
      symbolID: iconSymbolId,
      blockText: 'fingerprint #bg-blue-500 #rounded #fill-white #p-1 #w-8 #h-8',
    }),
    SketchModel.symbolInstance({
      do_objectID: featureItemDetailsLayerId,
      symbolID: featureItemDetailsSymbol.symbolID,
    }),
  ],
});

InferBlockMap[featureItemSymbolId] = ({ frame, blockText, siblingBlocks }) => {
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
};

export const featureRowSymbol = SketchModel.symbolMaster({
  symbolID: featureRowSymbolId,
  name: 'Feature Row',
  defaultBlockText: '#flex-row #gap-8 #mt-24',
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
  defaultBlockText: '#flex-col #center #px-20',
  blockDefinition: {
    hashtags: boxBlockHashtags,
    isComposedBlock: true,
  },
  layers: [
    SketchModel.symbolInstance({
      do_objectID: '1dea1c4d-f1bd-473b-a1aa-a0c6a1481ae2',
      symbolID: tagSymbolId,
      blockText: 'Highlighted Features',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'ef2d5b26-aa1c-40d3-8bab-37c10bccc5cb',
      symbolID: heading2SymbolId,
      blockText: 'From idea to launch #mt-2',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'aa722c35-9ba4-4bf3-a5d0-f7d17f02c361',
      symbolID: heading5SymbolId,
      blockText: "Build the business you've always wanted. #mt-2",
    }),
    SketchModel.symbolInstance({
      do_objectID: '75f1af59-564e-484a-8b46-34a18d2d3054',
      symbolID: featureRowSymbolId,
    }),
  ],
});
