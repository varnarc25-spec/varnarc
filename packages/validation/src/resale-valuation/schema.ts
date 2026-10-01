import { z } from 'zod';
import { uuidSchema } from '../common';

const optionalUuid = uuidSchema.optional().nullable();
const optionalText = z.string().max(200).optional().nullable();

export const upsertResaleValuationConfigSchema = z.object({
  type: z.string().trim().min(1).max(80),
  key: z.string().trim().min(1).max(80),
  value: z.coerce.number().finite(),
  manufacturerId: optionalUuid,
  modelId: optionalUuid,
  variantId: optionalUuid,
  segment: z.string().trim().max(40).optional().nullable(),
  fuelType: z.string().trim().max(40).optional().nullable(),
  minValue: z.coerce.number().finite().optional().nullable(),
  maxValue: z.coerce.number().finite().optional().nullable(),
  effectiveFrom: z.string().datetime().optional().nullable(),
  effectiveTo: z.string().datetime().optional().nullable(),
  sourceName: optionalText,
  sourceUrl: z
    .union([z.string().trim().url().max(500), z.literal('')])
    .optional()
    .nullable(),
  lastVerifiedAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const updateResaleValuationConfigSchema = upsertResaleValuationConfigSchema.partial();

export type UpsertResaleValuationConfigInput = z.infer<typeof upsertResaleValuationConfigSchema>;
export type UpdateResaleValuationConfigInput = z.infer<typeof updateResaleValuationConfigSchema>;
