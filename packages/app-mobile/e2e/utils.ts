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

export const dragDraw = async (
  element: Detox.IndexableNativeElement,
  from: { x: number; y: number },
  to: { x: number; y: number },
) => {
  await element.longPressAndDrag(
    500,
    from.x,
    from.y,
    element,
    to.x,
    to.y,
    'fast',
    100,
  );

  await new Promise((resolve) => setTimeout(resolve, 100));
};

export const createCustomTesters = (testFile: string) => ({
  expectToMatchScreenShot: expectToMatchScreenShot.bind(this, testFile),
});
