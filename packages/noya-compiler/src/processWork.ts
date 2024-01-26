export function reduceIterator<T, Result = T>(
  iterator: Iterator<T, T, unknown>,
  accumulator: (
    previousResult: Result,
    currentValue: T,
    isDone: boolean,
  ) => Result,
  initialValue: Result,
): Result {
  while (true) {
    const result = iterator.next();

    initialValue = accumulator(initialValue, result.value, !!result.done);

    if (result.done) break;
  }

  return initialValue;
}

export async function reduceIteratorChunked<T, Result = T>(
  iterator: Iterator<T, T, unknown>,
  targetDurationMs: number,
  accumulator: (
    previousResult: Result,
    currentValue: T,
    isDone: boolean,
  ) => Result,
  initialValue: Result,
): Promise<Result> {
  let chunkSize = 1; // Start with a single iteration per chunk
  let elapsedTime = 0;
  let finalValue = initialValue;
  let isDone = false;

  while (!isDone) {
    let startTime = Date.now();

    for (let i = 0; i < chunkSize; i++) {
      const result = iterator.next();

      finalValue = accumulator(finalValue, result.value, !!result.done);

      if (result.done) {
        isDone = true;
        break; // Exit the for loop immediately
      }

      // If not done, process the yielded value as needed (omitted here)
    }

    if (!isDone) {
      let currentTime = Date.now();
      elapsedTime += currentTime - startTime;

      // Adjust chunk size based on the average time per iteration
      if (elapsedTime >= targetDurationMs) {
        chunkSize = Math.max(
          1,
          Math.round((chunkSize * targetDurationMs) / elapsedTime),
        );
        elapsedTime = 0;
        await new Promise((resolve) => setTimeout(resolve, 0)); // Yield control
      }
    }
  }

  return finalValue;
}
