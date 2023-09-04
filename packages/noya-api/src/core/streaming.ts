export async function* streamResponse(
  response: Response,
): AsyncIterable<string> {
  if (!response.body) {
    // throw new Error('ReadableStream not available in this browser');
    yield await response.text();
    return;
  }

  // Create a TextDecoderStream
  const textDecoderStream = new TextDecoderStream();
  const readableStream = response.body.pipeThrough(textDecoderStream);

  // Set up a reader for the readableStream
  const reader = readableStream.getReader();

  // Read the stream and yield values as they become available
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    yield value;
  }
}

export function streamString(value: string) {
  async function* generator() {
    yield value;
  }

  return generator();
}
