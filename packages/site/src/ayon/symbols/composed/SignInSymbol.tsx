import { SketchModel } from 'noya-sketch-model';
import {
  boxSymbolId,
  buttonSymbolId,
  inputSymbolId,
  signInSymbolId,
  textSymbolId,
} from '../symbolIds';

export const signInSymbol = SketchModel.symbolMaster({
  symbolID: signInSymbolId,
  name: 'SignIn',
  blockDefinition: {
    placeholderParameters: ['flex-col', 'bg-transparent', 'p-4', 'gap-1'],
  },
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
      symbolID: boxSymbolId,
      // symbolID: spacerSymbolId,
      blockText: '#basis-2 #flex-auto',
    }),
    SketchModel.symbolInstance({
      do_objectID: 'c211148b-3dd1-45a1-83f8-708e49a25d49',
      symbolID: buttonSymbolId,
      blockText: 'Sign In #primary',
    }),
  ],
});
