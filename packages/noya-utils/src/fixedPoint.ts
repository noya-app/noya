type UnaryFunction<T> = (arg: T) => T;

export function fixedPoint<T>(
  func: UnaryFunction<T>,
  initialInput: T,
  maxIterations: number = 200,
): T | null {
  let currentInput = initialInput;
  let output = func(initialInput);

  let iteration = 0;

  while (output !== currentInput && iteration < maxIterations) {
    currentInput = output;
    output = func(output);
    iteration++;
  }

  // Return null if maximum iterations reached without finding fixed point
  return iteration >= maxIterations ? null : output;
}
