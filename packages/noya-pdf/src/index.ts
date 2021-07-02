export async function generateImageFromPDF(data: Uint8Array): Promise<Blob> {
  const pdf = await import('pdfjs-dist/legacy/build/pdf');
  const workerSrc = await import(
    'pdfjs-dist/legacy/build/pdf.worker.entry' as any
  );

  pdf.GlobalWorkerOptions.workerSrc = workerSrc;

  const canvas = document.createElement('canvas');
  const canvasContext = canvas.getContext('2d')!;

  const pdfDocument = await pdf.getDocument(data).promise;

  const page = await pdfDocument.getPage(1);

  // Render the page on a canvas with 100% scale.
  const viewport = page.getViewport({ scale: 1.0 });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext,
    viewport,
    background: 'rgba(0,0,0,0)',
  }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject('Failed to convert canvas to blob');
      }
    });
  });
}
