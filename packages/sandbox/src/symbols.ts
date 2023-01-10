import { SketchModel } from 'noya-sketch-model';

export const buttonSymbol = SketchModel.symbolMaster({
  name: 'Button',
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 100,
    height: 30,
  }),
  layers: [
    SketchModel.rectangle({
      frame: SketchModel.rect({
        x: 0,
        y: 0,
        width: 100,
        height: 30,
      }),
      style: SketchModel.style({
        fills: [
          SketchModel.fill({
            color: SketchModel.color({ red: 0, green: 0.5, blue: 1, alpha: 1 }),
          }),
        ],
      }),
    }),
    SketchModel.text({
      frame: SketchModel.rect({
        x: 6,
        y: 4,
        width: 100 - 12,
        height: 30 - 8,
      }),
      attributedString: SketchModel.attributedString({
        string: 'Button',
        attributes: [
          SketchModel.stringAttribute({
            location: 0,
            length: 6,
            attributes: {
              ...SketchModel.stringAttribute().attributes,
              MSAttributedStringColorAttribute: SketchModel.WHITE,
            },
          }),
        ],
      }),
    }),
  ],
});

export const avatarSymbol = SketchModel.symbolMaster({
  name: 'Avatar',
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 60,
    height: 60,
  }),
  layers: [
    SketchModel.rectangle({
      frame: SketchModel.rect({
        x: 0,
        y: 0,
        width: 60,
        height: 60,
      }),
      style: SketchModel.style({
        fills: [
          SketchModel.fill({
            color: SketchModel.color({ red: 0.5, green: 0, blue: 0, alpha: 1 }),
          }),
        ],
      }),
    }),
  ],
});

export const boxSymbol = SketchModel.symbolMaster({
  name: 'Box',
});

export const checkboxSymbol = SketchModel.symbolMaster({
  name: 'Checkbox',
});

export const iconButtonSymbol = SketchModel.symbolMaster({
  name: 'Icon Button',
});

export const inputSymbol = SketchModel.symbolMaster({
  name: 'Input',
});

export const switchSymbol = SketchModel.symbolMaster({
  name: 'Switch',
});

export const textSymbol = SketchModel.symbolMaster({
  name: 'Text',
});

export const imageSymbol = SketchModel.symbolMaster({
  name: 'Image',
});

export const headingSymbol = SketchModel.symbolMaster({
  name: 'Heading',
});
