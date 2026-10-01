import { readFileSync, writeFileSync } from 'node:fs';
import {
  auditMigratedVehicles,
  migrateVehiclePricingRecord,
} from '../../packages/validation/src/vehicle-pricing';

const inputPath = process.argv[2];
const auditPath = process.argv[3];
if (!inputPath || !auditPath) {
  throw new Error(
    'Usage: tsx scripts/automobile/migrate-vehicle-pricing-json.ts <vehicles.json> <audit.json>',
  );
}

const raw = JSON.parse(readFileSync(inputPath, 'utf8')) as
  { success?: boolean; data: Record<string, unknown>[] } | Record<string, unknown>[];
const rows = Array.isArray(raw) ? raw : raw.data;
const migrated = rows.map((row) => {
  const migration = migrateVehiclePricingRecord(row);
  return { slug: String(row.slug ?? ''), name: String(row.name ?? ''), migration };
});
const data = migrated.map((row) => row.migration.vehicle);
const audit = auditMigratedVehicles(migrated);
const output = Array.isArray(raw) ? data : { ...raw, data };
writeFileSync(inputPath, `${JSON.stringify(output, null, 2)}\n`);
writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      totalVehicles: audit.totalVehicles,
      ukPricesPreserved: audit.ukPricesPreserved,
      indiaPricesFound: audit.indiaPricesFound,
      unverifiedIndiaAvailability: audit.unverifiedIndiaAvailability,
      auditPath,
    },
    null,
    2,
  ),
);
