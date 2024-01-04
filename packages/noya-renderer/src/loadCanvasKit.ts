import type {
  CanvasKit,
  Paint,
  PaintStyle,
  Shader,
  TextStyle,
  loadCanvasKit as load,
} from '@noya-app/noya-canvaskit';

declare module '@noya-app/noya-canvaskit' {
  // Exposed for SVGKit, since we need to introspect the paint in SVGRenderer.
  // We need to implement these in CanvasKit too if we want to use with CanvasKit + SVGRenderer.
  interface Paint {
    style?: PaintStyle;
    _alpha?: number;
    _shader?: Shader;
  }
  interface Paragraph {
    _parts?: {
      text: string;
      style?: TextStyle;
    }[];
  }
}

// Using `var` avoids this being uninitialized, maybe due to circular dependencies
// eslint-disable-next-line no-var
var loadingPromise: ReturnType<typeof load> | undefined = undefined;

export function loadCanvasKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    const { defaultCreateURL, loadCanvasKit } = await import(
      '@noya-app/noya-canvaskit'
    );

    const CanvasKit = await loadCanvasKit({
      createURL: (base64) => {
        // If we're running in node, create a temporary file from this
        // base64 string and return the path to it
        const fs = require('fs');

        if (!('writeFileSync' in fs)) return defaultCreateURL(base64);

        const path = require('path');
        const os = require('os');
        const filePath = path.join(
          os.tmpdir(),
          `noya-canvaskit-${base64.length}.wasm`,
        );
        fs.writeFileSync(filePath, base64, 'base64');
        return filePath;
      },
    });

    patchForSVGRenderer(CanvasKit);

    resolve(CanvasKit);
  });

  return loadingPromise;
}

/**
 * Expose properties on Paint for SVGRenderer. These properties don't have getters
 * in CanvasKit, so we need to set them manually.
 */
function patchForSVGRenderer(CanvasKit: CanvasKit) {
  const _setStyle = CanvasKit.Paint.prototype.setStyle;
  const _setShader = CanvasKit.Paint.prototype.setShader;

  CanvasKit.Paint.prototype.setStyle = function (
    this: Paint,
    paintStyle: PaintStyle,
  ) {
    this.style = paintStyle;
    _setStyle.call(this, paintStyle);
  };

  CanvasKit.Paint.prototype.setShader = function (this: Paint, shader: Shader) {
    this._shader = shader;
    _setShader.call(this, shader);
  };
}
