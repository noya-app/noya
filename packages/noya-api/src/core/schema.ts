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

export const noyaAssetSchema = z.object({
  id: z.string(),
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
  version: z.number(),
});

export const noyaFileListSchema = z.array(noyaFileSchema);

export const noyaPriceSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  currency: z.string(),
  nickname: z.nullable(z.string()),
  recurringInterval: z.string(),
  recurringIntervalCount: z.number(),
  type: z.string(),
  unitAmount: z.number(),
  created: z.string(),
  url: z.optional(z.string()),
});

export const noyaSubscriptionItemSchema = z.object({
  id: z.string(),
  created: z.string(),
  price: noyaPriceSchema,
  quantity: z.number(),
});

export const noyaSubscriptionSchema = z.object({
  id: z.string(),
  cancelAtPeriodEnd: z.boolean(),
  currency: z.string(),
  currentPeriodEnd: z.string(),
  currentPeriodStart: z.string(),
  status: z.string(),
  cancelAt: z.nullable(z.string()),
  canceledAt: z.nullable(z.string()),
  created: z.string(),
  endedAt: z.nullable(z.string()),
  trialEnd: z.nullable(z.string()),
  trialStart: z.nullable(z.string()),
  items: z.array(noyaSubscriptionItemSchema),
});

export const noyaProductSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  description: z.nullable(z.string()),
  name: z.string(),
  created: z.string(),
  prices: z.array(noyaPriceSchema),
});

export const noyaBillingSchema = z.object({
  subscriptions: z.array(noyaSubscriptionSchema),
  portalUrl: z.nullable(z.string()),
  availableProducts: z.array(noyaProductSchema),
});

export type NoyaUser = z.infer<typeof noyaUserSchema>;
export type NoyaSession = z.infer<typeof noyaSessionSchema>;
export type NoyaFileData = z.infer<typeof noyaFileDataSchema>;
export type NoyaFile = z.infer<typeof noyaFileSchema>;
export type NoyaFileList = z.infer<typeof noyaFileListSchema>;
export type NoyaBilling = z.infer<typeof noyaBillingSchema>;
export type NoyaSubscription = z.infer<typeof noyaSubscriptionSchema>;
export type NoyaSubscriptionItem = z.infer<typeof noyaSubscriptionItemSchema>;
export type NoyaProduct = z.infer<typeof noyaProductSchema>;
export type NoyaPrice = z.infer<typeof noyaPriceSchema>;

export type NoyaExportFormat = 'png' | 'pdf' | 'svg';
