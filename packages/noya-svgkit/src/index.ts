import { createJSPath } from './JSPath';
import { SVGKit } from './SVGKit';

let loadingPromise: Promise<typeof SVGKit> | undefined = undefined;

export function loadSVGKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    const { defaultCreateURL, loadPathKit } = await import(
      '@noya-app/noya-pathkit'
    );

    const PathKit = await loadPathKit({
      createURL: (base64) => {
        // If we're running in node, create a temporary file from this
        // base64 string and return the path to it
        const fs = require('fs');

        if (!('writeFileSync' in fs)) return defaultCreateURL(base64);

        const path = require('path');
        const os = require('os');
        const filePath = path.join(
          os.tmpdir(),
          `noya-pathkit-${base64.length}.wasm`,
        );
        fs.writeFileSync(filePath, base64, 'base64');
        return filePath;
      },
    });

    (SVGKit as any).Path = createJSPath(PathKit);

    resolve(SVGKit);
  });

  return loadingPromise;
}
