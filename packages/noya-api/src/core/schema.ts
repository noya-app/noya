import Sketch from 'noya-file-format';
import { SketchFile } from 'noya-sketch-file';
import { z } from 'zod';

export type NoyaJson =
  | string
  | number
  | boolean
  | null
  | NoyaJson[]
  | { [key: string]: NoyaJson };

export const noyaJsonSchema = z.unknown();

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

export const noyaFileDataSchema = z.union([
  z.object({
    name: z.string(),
    type: z.literal('io.noya.ayon'),
    schemaVersion: z.literal('0.1.0'),
    document: z.custom<SketchFile>(),
  }),
  z.object({
    name: z.string(),
    type: z.literal('io.noya.ds'),
    schemaVersion: z.literal('0.1.0'),
    document: z.custom<DS>(),
  }),
]);

export type DSSource = {
  type: 'npm';
  name: string;
  version: string;
};

export type DSConfig = Sketch.DesignSystemThemeConfig;

export type DS = {
  source: DSSource;
  config: DSConfig;
  components?: unknown[];
  prompt?: {
    inputDescription?: string;
    pickComponent?: string;
    populateTemplate?: string;
  };
};

export const dsDataSchema = z.object({
  name: z.string(),
  type: z.literal('io.noya.ds'),
  schemaVersion: z.literal('0.1.0'),
  document: z.custom<DS>(),
});

export const noyaFileSchema = z.object({
  id: z.string(),
  data: z
    .string()
    .transform((json) => noyaFileDataSchema.parse(JSON.parse(json))),
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

export const noyaSharedFileSchema = noyaFileSchema.extend({
  fileId: z.optional(z.string()),
  duplicable: z.boolean(),
});

export const noyaShareSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fileId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  viewable: z.boolean(),
  duplicable: z.boolean(),
});

export const noyaEmailListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.nullable(z.string()),
  optIn: z.boolean(),
  url: z.string(),
});

export const noyaExperimentsSchema = z.object({});

export const noyaMetadataItemSchema = z.object({
  key: z.string(),
  value: noyaJsonSchema,
  url: z.string(),
});

export const noyaUserDataSchema = z.object({
  emailLists: z.array(noyaEmailListSchema),
  experiments: noyaExperimentsSchema,
  metadata: z.array(noyaMetadataItemSchema),
});

export const generatedNameSchema = z.object({ name: z.string() });

export const randomImageResponseSchema = z.object({
  url: z.string(),
  metadata: z.object({
    color: z.string(),
  }),
  user: z.object({
    name: z.string(),
    url: z.string(),
  }),
  source: z.object({
    name: z.string(),
    url: z.string(),
  }),
});

export const randomIconResponseSchema = z.object({
  icons: z.array(z.string()),
});

export type NoyaUser = z.infer<typeof noyaUserSchema>;
export type NoyaSession = z.infer<typeof noyaSessionSchema>;
export type NoyaFileData = z.infer<typeof noyaFileDataSchema>;
export type NoyaDocument = NoyaFileData['document'];
export type NoyaFile = z.infer<typeof noyaFileSchema>;
export type NoyaFileList = z.infer<typeof noyaFileListSchema>;
export type NoyaBilling = z.infer<typeof noyaBillingSchema>;
export type NoyaSubscription = z.infer<typeof noyaSubscriptionSchema>;
export type NoyaSubscriptionItem = z.infer<typeof noyaSubscriptionItemSchema>;
export type NoyaProduct = z.infer<typeof noyaProductSchema>;
export type NoyaPrice = z.infer<typeof noyaPriceSchema>;
export type NoyaShare = z.infer<typeof noyaShareSchema>;
export type NoyaSharedFile = z.infer<typeof noyaSharedFileSchema>;
export type NoyaEmailList = z.infer<typeof noyaEmailListSchema>;
export type NoyaUserData = z.infer<typeof noyaUserDataSchema>;
export type NoyaExperiments = z.infer<typeof noyaExperimentsSchema>;
export type NoyaMetadataItem = z.infer<typeof noyaMetadataItemSchema>;
export type NoyaGeneratedName = z.infer<typeof generatedNameSchema>;
export type NoyaRandomImageResponse = z.infer<typeof randomImageResponseSchema>;
export type NoyaRandomIconResponse = z.infer<typeof randomIconResponseSchema>;

export type NoyaExportFormat = 'png' | 'pdf' | 'svg';
