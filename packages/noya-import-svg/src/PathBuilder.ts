import { CommandWithoutQuadratics } from '@lona/svg-model';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Point } from 'noya-geometry';
import { PointString, SketchModel } from 'noya-sketch-model';

function makeCurvePoint(
  curveMode: Sketch.CurveMode,
  point: Point,
  curveTo?: Point,
  curveFrom?: Point,
): Sketch.CurvePoint {
  return SketchModel.curvePoint({
    curveMode: curveMode || Sketch.CurveMode.None,
    point: PointString.encode(point),
    curveTo: PointString.encode(curveTo || point),
    curveFrom: PointString.encode(curveFrom || point),
    hasCurveTo: !!curveTo,
    hasCurveFrom: !!curveFrom,
  });
}

type Path = Pick<Sketch.ShapePath, 'isClosed' | 'points'>;

// This is a rough port of Lona's PDF to Sketch path conversion
// https://github.com/airbnb/Lona/blob/94fd0b26de3e3f4b4496cdaa4ab31c6d258dc4ac/studio/LonaStudio/Utils/Sketch.swift#L285
class PathBuilder {
  addCommand(command: CommandWithoutQuadratics) {
    switch (command.type) {
      case 'line': {
        const curvePoint = makeCurvePoint(
          Sketch.CurveMode.Straight,
          command.to,
        );
        this.curvePoints.push(curvePoint);
        break;
      }
      case 'move': {
        this.finishPath(false);

        const curvePoint = makeCurvePoint(
          Sketch.CurveMode.Straight,
          command.to,
        );
        this.curvePoints.push(curvePoint);
        break;
      }
      case 'cubicCurve': {
        const last = this.lastCurvePoint;

        if (last) {
          last.curveFrom = PointString.encode(command.controlPoint1);
          last.curveMode = Sketch.CurveMode.Mirrored;
          last.hasCurveFrom = true;
        }

        const curvePoint = makeCurvePoint(
          Sketch.CurveMode.Mirrored,
          command.to,
          command.controlPoint2,
        );

        this.curvePoints.push(curvePoint);
        break;
      }
      case 'close': {
        const first = this.firstCurvePoint;
        const last = this.lastCurvePoint;

        // If first and last points are equal, combine them
        if (first && last && first.point === last.point && last.hasCurveTo) {
          first.curveTo = last.curveTo;
          first.hasCurveTo = last.hasCurveTo;
          first.curveMode = Sketch.CurveMode.Mirrored;

          this.curvePoints.pop();
        }

        this.finishPath(true);
        break;
      }
      default:
        throw new Error(`Invalid SVG path command: ${JSON.stringify(command)}`);
    }
  }

  done() {
    this.finishPath(false);

    return this.paths;
  }

  private paths: Path[] = [];

  private curvePoints: Sketch.CurvePoint[] = [];

  private finishPath(isClosed: boolean) {
    if (this.curvePoints.length === 0) return;

    this.paths.push({ points: this.curvePoints, isClosed });
    this.curvePoints = [];
  }

  get firstCurvePoint(): Sketch.CurvePoint | undefined {
    return this.curvePoints.length > 0 ? this.curvePoints[0] : undefined;
  }

  get lastCurvePoint(): Sketch.CurvePoint | undefined {
    return this.curvePoints.length > 0
      ? this.curvePoints[this.curvePoints.length - 1]
      : undefined;
  }
}

export function makePathsFromCommands(
  commands: CommandWithoutQuadratics[],
): Path[] {
  const builder = new PathBuilder();

  commands.forEach((command) => {
    builder.addCommand(command);
  });

  return builder.done();
}
