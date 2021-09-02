const appName = 'Noya';
const appBundleId = 'com.noyasoftware.noya';

const config = {
  packagerConfig: {
    name: appName,
    executableName: appName,
    appBundleId,
    osxSign: {
      identity: 'Developer ID Application: Devin Abbott (CV2RHZWPY9)',
      hardenedRuntime: true,
      'gatekeeper-assess': false,
      entitlements: './entitlements.plist',
      'entitlements-inherit': './entitlements.plist',
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
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'noya_desktop',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              name: 'main_window',
              js: './src/preload.ts',
              preload: {
                js: './src/preload.ts',
              },
            },
          ],
        },
      },
    ],
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

  config.packagerConfig.osxNotarize = {
    appBundleId,
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_ID_PASSWORD,
    ascProvider: 'CV2RHZWPY9',
  };
}

notarizeMaybe();

module.exports = config;
