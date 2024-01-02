import { TupleOf } from '@noya-app/noya-utils';

export enum PathCommandVerb {
  move = 0,
  line = 1,
  quad = 2,
  conic = 3,
  cubic = 4,
  close = 5,
}

const commandParameterCount = {
  [PathCommandVerb.move]: 2,
  [PathCommandVerb.line]: 2,
  [PathCommandVerb.quad]: 4,
  [PathCommandVerb.conic]: 5,
  [PathCommandVerb.cubic]: 6,
  [PathCommandVerb.close]: 0,
} as const;

export type PathCommand = {
  [P in PathCommandVerb]: [
    P,
    ...TupleOf<number, (typeof commandParameterCount)[P]>,
  ];
}[PathCommandVerb];

export function parsePathCmds(input: Float32Array) {
  const result: PathCommand[] = [];

  let i = 0;
  while (i < input.length) {
    const cmd = input[i] as PathCommandVerb;
    i++;
    const count = commandParameterCount[cmd];
    const params = input.slice(i, i + count);
    i += count;
    result.push([cmd, ...params] as PathCommand);
  }

  return result;
}
