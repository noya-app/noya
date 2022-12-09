import { z } from 'zod';

const baseValueSchema = z.object({
  id: z.string(),
  key: z.string().default(''),
});

const stringSchema = z
  .object({ type: z.literal('string'), value: z.string() })
  .merge(baseValueSchema);

const numberSchema = z
  .object({ type: z.literal('number'), value: z.number() })
  .merge(baseValueSchema);

const booleanSchema = z
  .object({ type: z.literal('boolean'), value: z.boolean() })
  .merge(baseValueSchema);

const objectSchema = z
  .object({ type: z.literal('object') })
  .merge(baseValueSchema);

const arraySchema = z
  .object({ type: z.literal('array') })
  .merge(baseValueSchema);

const nullSchema = z.object({ type: z.literal('null') }).merge(baseValueSchema);

const jsonValueSchema = z.discriminatedUnion('type', [
  stringSchema,
  numberSchema,
  booleanSchema,
  objectSchema,
  arraySchema,
  nullSchema,
]);

const rootObjectSchema = z
  .object({
    type: z.literal('object').default('object'),
  })
  .merge(baseValueSchema);

export const noyaJsonObjectSchema = z.union([
  jsonValueSchema,
  rootObjectSchema,
]);
