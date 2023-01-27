export function downloadBlob(blob: Blob, name: string): void;
export function downloadBlob(blob: File): void;
export function downloadBlob(
  ...params: [blob: Blob, name: string] | [blob: File]
): void {
  const exportUrl = URL.createObjectURL(params[0]);
  const name = params.length === 1 ? params[0].name : params[1];

  const a = document.createElement('a');
  a.href = exportUrl;
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(exportUrl);
}

export async function downloadUrl(url: string, name: string) {
  const response = await fetch(url, { credentials: 'include' });
  const blob = await response.blob();

  downloadBlob(blob, name);
}
