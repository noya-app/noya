import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import type { WebpackConfiguration } from '@electron-forge/plugin-webpack/dist/Config';
import type { ForgeConfig } from '@electron-forge/shared-types';

import mainConfig from './webpack.main.config';
import rendererConfig from './webpack.renderer.config';

const appName = 'Noya';
const appBundleId = 'com.noyasoftware.noya';

const config: ForgeConfig = {
  packagerConfig: {
    name: appName,
    executableName: appName,
    appBundleId,
    osxSign: {
      identity: 'Developer ID Application: Devin Abbott (CV2RHZWPY9)',
      optionsForFile() {
        return {
          hardenedRuntime: true,
          'gatekeeper-assess': false,
          entitlements: './entitlements.plist',
        };
      },
    },
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'noya-app',
          name: 'noya',
        },
        draft: true,
      },
    },
  ],
  makers: [
    new MakerSquirrel({
      name: 'noya_desktop',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig: mainConfig as WebpackConfiguration,
      renderer: {
        config: rendererConfig as WebpackConfiguration,
        entryPoints: [
          {
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
  ],
};

// https://github.com/electron/fiddle/blob/523f9a4eb65479ac7382338a209f9ccc2c8815c3/forge.config.js#L116-L139
function notarizeMaybe() {
  if (process.platform !== 'darwin') {
    return;
  }

  if (!process.env.CI && !process.env.FORCE_NOTARIZE) {
    console.info(`Not in CI, skipping notarization`);
    return;
  }

  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.warn(
      'Should be notarizing, but environment variables APPLE_ID or APPLE_ID_PASSWORD are missing!',
    );
    return;
  }

  (config.packagerConfig as any).osxNotarize = {
    appBundleId,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    ascProvider: 'CV2RHZWPY9',
  };
}

notarizeMaybe();

module.exports = config;
