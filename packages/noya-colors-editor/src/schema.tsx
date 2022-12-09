import { z } from 'zod';

const hsvaColorSchema = z.object({
  hue: z.number().default(0),
  saturation: z.number().default(0),
  value: z.number().default(0),
  alpha: z.number().default(0),
});

export const colorSchema = z.object({
  red: z.number().min(0).max(1).default(1),
  green: z.number().min(0).max(1).default(1),
  blue: z.number().min(0).max(1).default(1),
  alpha: z.number().min(0).max(1).default(1),
  colorSpaces: z
    .object({
      hsva: hsvaColorSchema.optional(),
    })
    .optional(),
});

export type Color = z.infer<typeof colorSchema>;

export const colorSwatchSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  color: colorSchema.default({}),
});

export type ColorSwatch = z.infer<typeof colorSwatchSchema>;

export const colorSwatchArraySchema = z.array(colorSwatchSchema);

export const documentSchema = z
  .object({
    id: z.string().default(''),
    children: colorSwatchArraySchema.default([]),
  })
  .default({});

export const userDataSchema = z
  .object({
    selectedIds: z.array(z.string()).default([]),
    timestamp: z.number().default(0),
  })
  .default({});

export type UserData = z.infer<typeof userDataSchema>;

export const userStoreSchema = z.preprocess(
  (obj: any) => {
    // obj can be undefined when initialized
    // obj can contain userDataMap if it was initialized to the zod default value
    const { id, children, userDataMap, ...rest } = obj ?? {};
    return { id, userDataMap: rest };
  },
  z
    .object({
      id: z.string().default(''),
      userDataMap: z.record(z.string(), userDataSchema).default({}),
    })
    .default({}),
);

export type UserStore = z.infer<typeof userStoreSchema>;

export type ColorsDocument = z.infer<typeof documentSchema>;

export type AppData = {
  userStore: UserStore;
  document: ColorsDocument;
};
