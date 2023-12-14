export function sanitizePackageName(input: string): string {
  let sanitized = input;

  // Convert to lowercase
  sanitized = sanitized.toLowerCase();

  // Remove leading periods or underscores
  while (sanitized.startsWith('.') || sanitized.startsWith('_')) {
    sanitized = sanitized.substring(1);
  }

  // Replace disallowed characters with hyphen '-'
  sanitized = sanitized.replace(/[^a-z0-9-._]/g, '-');

  // Replace reserved names
  const reservedNames = ['node_modules', 'favicon.ico'];
  if (reservedNames.includes(sanitized)) {
    sanitized += '-package';
  }

  // Trim to length
  if (sanitized.length > 214) {
    sanitized = sanitized.substring(0, 214);
  }

  // If sanitized string is empty, set a default string
  if (sanitized === '') {
    sanitized = 'my-package';
  }

  return sanitized;
}

export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
export function isSafeForJsxText(text: string) {
  return !/[{}<>]/.test(text);
}
