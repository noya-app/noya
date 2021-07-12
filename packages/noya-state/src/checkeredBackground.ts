// A simple, unoptimized decoder for small images
function decodeBase64(string: string) {
  return new Uint8Array(
    atob(string)
      .split('')
      .map((char) => char.charCodeAt(0)),
  );
}

const CHECKERED_BACKGROUND = `iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAQMAAADaua+7AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABNJREFUCNdjYOD/TxL+/4GBFAwAvMsj3bQ3H74AAAAASUVORK5CYII=`;

export const CHECKERED_BACKGROUND_BYTES = decodeBase64(CHECKERED_BACKGROUND);
