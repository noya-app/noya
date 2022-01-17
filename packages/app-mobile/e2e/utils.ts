import path from 'path';
import fs from 'fs';

function ensureDirectoryExistence(filePath: string) {
  var dirname = path.dirname(filePath);

  if (fs.existsSync(dirname)) {
    return true;
  }

  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

const expectToMatchScreenShot = async (testFile: string, testName: string) => {
  const fileName = path.basename(testFile, '.e2e.ts');
  const dirPath = path.dirname(testFile);

  const snapshottedImagePath = `${dirPath}/snapshots/${fileName}.${testName}.detox.png`;
  let snappshotImage;

  try {
    snappshotImage = fs.readFileSync(snapshottedImagePath);
  } catch {}

  const screenShotPath = await device.takeScreenshot(testName);
  const screenShotImage = fs.readFileSync(screenShotPath);

  if (!snappshotImage) {
    ensureDirectoryExistence(snapshottedImagePath);
    fs.writeFileSync(snapshottedImagePath, screenShotImage);
    return;
  }

  if (!screenShotImage.equals(snappshotImage)) {
    const args = process.argv;

    if (args.includes('-u')) {
      fs.writeFileSync(snapshottedImagePath, screenShotImage);
      return;
    }

    throw new Error(
      `The test ${testName} was expected to match the snapshot file at ${snapshottedImagePath}, but it was different!`,
    );
  }
};

export const createCustomTesters = (testFile: string) => ({
  expectToMatchScreenShot: expectToMatchScreenShot.bind(this, testFile),
});
