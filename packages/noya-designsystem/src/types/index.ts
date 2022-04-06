export const SUPPORTED_IMAGE_UPLOAD_TYPES = [
  'image/png' as const,
  'image/jpeg' as const,
  'image/webp' as const,
  'application/pdf' as const,
  'image/svg+xml' as const,
];

export const SUPPORTED_CANVAS_UPLOAD_TYPES = [
  ...SUPPORTED_IMAGE_UPLOAD_TYPES,
  '' as const,
];

export type SupportedImageUploadType =
  typeof SUPPORTED_IMAGE_UPLOAD_TYPES[number];

export type SupportedCanvasUploadType =
  typeof SUPPORTED_CANVAS_UPLOAD_TYPES[number];

export type RelativeDropPosition = 'above' | 'below' | 'inside';
