export enum PlatformName {
  Web = 'Web',
  Native = 'Native',
  Electron = 'Electron',
}

export const Platform = {
  isNative: false,
  isWeb: false,
  isElectron: false,
};

export function setPlaform(platformName: PlatformName) {
  if (platformName === PlatformName.Native) {
    Platform.isNative = true;
    Platform.isWeb = false;
    Platform.isElectron = false;
  }

  if (platformName === PlatformName.Web) {
    Platform.isNative = false;
    Platform.isWeb = true;
    Platform.isElectron = false;
  }

  if (platformName === PlatformName.Electron) {
    Platform.isNative = false;
    Platform.isWeb = true; // ?
    Platform.isElectron = true;
  }
}
