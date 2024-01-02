import { Sketch } from '@noya-app/noya-file-format';

export type ComponentMap = Record<string, React.FC<any>>;

export type RenderProps = {
  passthrough: Record<string, any>;
  Components: ComponentMap;
  instance: Sketch.SymbolInstance;
  children?: React.ReactNode;
  getSymbolMaster: (symbolId: string) => Sketch.SymbolMaster;
};
