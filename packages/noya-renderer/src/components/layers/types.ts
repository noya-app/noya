import { Sketch } from '@noya-app/noya-file-format';
import { PageLayer } from 'noya-state';

interface Props {
  layer: PageLayer | Sketch.Page;
}

type SketchLayerType = (props: Props) => JSX.Element | null;

export type BaseLayerProps = {
  SketchLayer: SketchLayerType;
};
