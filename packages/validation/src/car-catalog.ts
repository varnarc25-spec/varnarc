import { z } from 'zod';
import { cursorPaginationQuerySchema, publishStatusSchema, slugSchema, uuidSchema } from './common';

export const carBodyTypeSchema = z.enum([
  'Hatchback',
  'Sedan',
  'SUV',
  'Compact SUV',
  'Coupe',
  'Convertible',
  'MPV',
  'MUV',
  'Pickup',
  'Wagon',
  'Crossover',
  'Minivan',
  'Luxury',
  'Sports Car',
]);

export const vehicleSegmentSchema = z.enum(['A', 'B', 'B+', 'C', 'C+', 'D', 'E', 'F']);

export const catalogFuelTypeSchema = z.enum([
  'Petrol',
  'Diesel',
  'CNG',
  'LPG',
  'Electric',
  'Hybrid',
  'Plug-in Hybrid',
]);

export const catalogTransmissionSchema = z.enum([
  'Manual',
  'AMT',
  'CVT',
  'DCT',
  'DSG',
  'Torque Converter',
  'Automatic',
  'e-CVT',
  'Single Speed',
]);

export const drivetrainSchema = z.enum(['FWD', 'RWD', 'AWD', '4WD']);

export const mileageUnitSchema = z.enum(['km/l', 'km/kg', 'km/kWh']);

export const carCatalogSearchQuerySchema = cursorPaginationQuerySchema.extend({
  brandId: uuidSchema.optional(),
  modelId: uuidSchema.optional(),
  brandSlug: z.string().max(120).optional(),
  modelSlug: z.string().max(120).optional(),
  fuelType: catalogFuelTypeSchema.optional(),
  transmissionType: catalogTransmissionSchema.optional(),
  drivetrain: drivetrainSchema.optional(),
  bodyType: carBodyTypeSchema.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minEngineCc: z.coerce.number().min(0).optional(),
  maxEngineCc: z.coerce.number().min(0).optional(),
  minPowerBhp: z.coerce.number().min(0).optional(),
  minMileage: z.coerce.number().min(0).optional(),
  minSeats: z.coerce.number().int().min(2).optional(),
  maxSeats: z.coerce.number().int().min(2).optional(),
  minSafety: z.coerce.number().min(0).max(5).optional(),
  minAirbags: z.coerce.number().int().min(0).optional(),
  sunroof: z.coerce.boolean().optional(),
  automatic: z.coerce.boolean().optional(),
  minEvRangeKm: z.coerce.number().min(0).optional(),
  minBatteryKwh: z.coerce.number().min(0).optional(),
  minBootLitre: z.coerce.number().min(0).optional(),
  minGroundClearanceMm: z.coerce.number().min(0).optional(),
  minWarrantyYears: z.coerce.number().int().min(0).optional(),
  city: z.string().max(80).optional(),
  listing: z.enum(['new', 'used']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'name']).optional(),
});

export const carCompareQuerySchema = z.object({
  ids: z
    .string()
    .min(1)
    .transform((v) =>
      v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .pipe(z.array(uuidSchema).min(2).max(4)),
});

export const upsertCarModelSchema = z.object({
  brandId: uuidSchema,
  name: z.string().min(1).max(120),
  slug: slugSchema.optional(),
  generation: z.string().max(80).optional().nullable(),
  facelift: z.string().max(80).optional().nullable(),
  launchYear: z.number().int().min(1950).max(2100).optional().nullable(),
  discontinuedYear: z.number().int().min(1950).max(2100).optional().nullable(),
  bodyType: carBodyTypeSchema.optional().nullable(),
  vehicleSegment: vehicleSegmentSchema.optional().nullable(),
  description: z.string().max(8000).optional().nullable(),
  status: publishStatusSchema.optional(),
  seoTitle: z.string().max(180).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
});

export const upsertCatalogVariantSchema = z.object({
  modelId: uuidSchema,
  name: z.string().min(1).max(150),
  slug: slugSchema.optional(),
  variantCode: z.string().max(80).optional().nullable(),
  modelYear: z.number().int().min(1950).max(2100).optional().nullable(),
  launchDate: z.string().optional().nullable(),
  discontinuedDate: z.string().optional().nullable(),
  fuelType: catalogFuelTypeSchema.optional().nullable(),
  transmissionType: catalogTransmissionSchema.optional().nullable(),
  drivetrain: drivetrainSchema.optional().nullable(),
  exShowroomPrice: z.number().min(0).optional().nullable(),
  status: publishStatusSchema.optional(),
  seoTitle: z.string().max(180).optional().nullable(),
  seoDescription: z.string().max(320).optional().nullable(),
  sourceName: z.string().max(160).optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
  sourceDate: z.string().optional().nullable(),
});

export const upsertEngineSpecSchema = z.object({
  engineType: z.string().max(80).optional().nullable(),
  engineName: z.string().max(120).optional().nullable(),
  engineCode: z.string().max(80).optional().nullable(),
  displacementCc: z.number().positive().optional().nullable(),
  cylinders: z.number().int().min(2).max(12).optional().nullable(),
  valvesPerCylinder: z.number().int().min(1).max(8).optional().nullable(),
  totalValves: z.number().int().min(1).optional().nullable(),
  aspiration: z.string().max(80).optional().nullable(),
  fuelSystem: z.string().max(80).optional().nullable(),
  maxPowerBhp: z.number().positive().optional().nullable(),
  maxPowerKw: z.number().positive().optional().nullable(),
  maxPowerRpm: z.number().int().positive().optional().nullable(),
  maxTorqueNm: z.number().positive().optional().nullable(),
  maxTorqueRpm: z.number().int().positive().optional().nullable(),
  compressionRatio: z.string().max(40).optional().nullable(),
  boreMm: z.number().positive().optional().nullable(),
  strokeMm: z.number().positive().optional().nullable(),
  startStop: z.boolean().optional().nullable(),
  turbocharger: z.boolean().optional().nullable(),
  supercharger: z.boolean().optional().nullable(),
});

export const upsertEvSpecSchema = z.object({
  batteryCapacityKwh: z.number().positive().optional().nullable(),
  usableBatteryCapacityKwh: z.number().positive().optional().nullable(),
  batteryType: z.string().max(80).optional().nullable(),
  batteryWarrantyYears: z.number().int().min(0).optional().nullable(),
  batteryWarrantyKm: z.number().int().min(0).optional().nullable(),
  motorPowerKw: z.number().positive().optional().nullable(),
  motorPowerBhp: z.number().positive().optional().nullable(),
  motorTorqueNm: z.number().positive().optional().nullable(),
  rangeClaimedKm: z.number().int().positive().optional().nullable(),
  rangeRealWorldKm: z.number().int().positive().optional().nullable(),
  chargingType: z.string().max(40).optional().nullable(),
  acChargingKw: z.number().positive().optional().nullable(),
  dcFastChargingKw: z.number().positive().optional().nullable(),
  chargingTimeAc: z.string().max(80).optional().nullable(),
  chargingTimeDc: z.string().max(80).optional().nullable(),
  dcChargeTime1080: z.string().max(80).optional().nullable(),
  regenerativeBraking: z.boolean().optional().nullable(),
  chargingConnector: z.string().max(80).optional().nullable(),
});

export const upsertVariantFeatureSchema = z.object({
  featureId: uuidSchema,
  value: z.string().max(200).optional().nullable(),
  numericValue: z.number().optional().nullable(),
  booleanValue: z.boolean().optional().nullable(),
  displayValue: z.string().max(200).optional().nullable(),
  unit: z.string().max(40).optional().nullable(),
});

export const upsertUsedVehicleSchema = z.object({
  variantId: uuidSchema,
  registrationNumber: z.string().max(20).optional().nullable(),
  vin: z.string().min(11).max(17).optional().nullable(),
  engineNumber: z.string().max(40).optional().nullable(),
  chassisNumber: z.string().max(40).optional().nullable(),
  color: z.string().max(40).optional().nullable(),
  odometerKm: z.number().int().min(0).optional().nullable(),
  ownerCount: z.number().int().min(1).max(20).optional().nullable(),
  askingPrice: z.number().min(0).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  locality: z.string().max(120).optional().nullable(),
  pincode: z.string().max(12).optional().nullable(),
  vehicleCondition: z
    .enum(['Excellent', 'Very Good', 'Good', 'Fair', 'Needs Repair'])
    .optional()
    .nullable(),
  listingStatus: z.enum(['DRAFT', 'PUBLISHED', 'SOLD', 'ARCHIVED']).optional(),
});

export type CarCatalogSearchQuery = z.infer<typeof carCatalogSearchQuerySchema>;
export type CarCompareQuery = z.infer<typeof carCompareQuerySchema>;
export type UpsertCarModelInput = z.infer<typeof upsertCarModelSchema>;
export type UpsertCatalogVariantInput = z.infer<typeof upsertCatalogVariantSchema>;
export type UpsertEngineSpecInput = z.infer<typeof upsertEngineSpecSchema>;
export type UpsertEvSpecInput = z.infer<typeof upsertEvSpecSchema>;
export type UpsertUsedVehicleInput = z.infer<typeof upsertUsedVehicleSchema>;
