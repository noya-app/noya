import { SketchFile } from 'noya-sketch-file';
import { z } from 'zod';

export const noyaUserSchema = z.object({
  id: z.string(),
  name: z.nullable(z.string()),
  email: z.nullable(z.string()),
  image: z.nullable(z.string()),
});

export const noyaSessionSchema = z.object({
  user: noyaUserSchema,
  expires: z.string(),
});

export const noyaFileDataSchema = z
  .object({
    name: z.string(),
    type: z.literal('io.noya.ayon'),
    schemaVersion: z.literal('0.1.0'),
    document: z.custom<SketchFile>(),
  })
  .passthrough();

export const noyaFileSchema = z.object({
  id: z.string(),
  data: z
    .string()
    .transform((json) => noyaFileDataSchema.parse(JSON.parse(json))),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const noyaFileListSchema = z.array(noyaFileSchema);

export type NoyaUser = z.infer<typeof noyaUserSchema>;
export type NoyaSession = z.infer<typeof noyaSessionSchema>;
export type NoyaFileData = z.infer<typeof noyaFileDataSchema>;
export type NoyaFile = z.infer<typeof noyaFileSchema>;
export type NoyaFileList = z.infer<typeof noyaFileListSchema>;
