import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export function getAppVersion(): string | undefined {
  try {
    const packagePath = path.join(app.getAppPath(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version;
  } catch (e) {
    console.info('Failed to read app version from package.json');
    return undefined;
  }
}
