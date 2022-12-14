import { z } from 'zod';

export const colorSchema = z.object({
  red: z.number().min(0).max(1),
  green: z.number().min(0).max(1),
  blue: z.number().min(0).max(1),
  alpha: z.number().min(0).max(1),
});

export type Color = z.infer<typeof colorSchema>;

export const colorSwatchSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  color: colorSchema,
});

export type ColorSwatch = z.infer<typeof colorSwatchSchema>;

export const documentSchema = z
  .object({
    id: z.string().default(''),
    children: z.array(colorSwatchSchema).default([]),
  })
  .default({});

export const userDataSchema = z
  .object({
    id: z.string().default(''),
    selectedIds: z.array(z.string()).default([]),
  })
  .default({});

export type UserData = z.infer<typeof userDataSchema>;

const genericObjectSchema = z.object({ id: z.string() }).passthrough();

// type AppData = {
//   userDataNodeId: string;
//   documentNodeId: string;
// };

export const appDataSchema = z.object({
  userDataNodeId: z.string(),
  documentNodeId: z.string(),
  children: z.array(genericObjectSchema),
});

export type AppData = z.infer<typeof appDataSchema>;
