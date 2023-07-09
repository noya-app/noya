import Sketch from 'noya-file-format';

export type ComponentMap = Record<string, React.FC<any>>;

export type RenderProps = {
  Components: ComponentMap;
  instance: Sketch.SymbolInstance;
  children?: React.ReactNode;
  getSymbolMaster: (symbolId: string) => Sketch.SymbolMaster;
};
