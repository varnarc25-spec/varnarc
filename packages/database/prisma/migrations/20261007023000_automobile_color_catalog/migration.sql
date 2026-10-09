CREATE TABLE "automobile_colors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "name_key" TEXT NOT NULL,
    "hex" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "automobile_colors_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "automobile_colors_name_key_key" ON "automobile_colors"("name_key");
CREATE INDEX "automobile_colors_deleted_at_idx" ON "automobile_colors"("deleted_at");

CREATE TABLE "automobile_vehicle_colors" (
    "vehicle_id" UUID NOT NULL,
    "color_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "automobile_vehicle_colors_pkey" PRIMARY KEY ("vehicle_id","color_id")
);

CREATE INDEX "automobile_vehicle_colors_color_id_idx" ON "automobile_vehicle_colors"("color_id");

ALTER TABLE "automobile_vehicle_colors"
  ADD CONSTRAINT "automobile_vehicle_colors_vehicle_id_fkey"
  FOREIGN KEY ("vehicle_id") REFERENCES "automobile_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "automobile_vehicle_colors"
  ADD CONSTRAINT "automobile_vehicle_colors_color_id_fkey"
  FOREIGN KEY ("color_id") REFERENCES "automobile_colors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "automobile_colors" ("id", "name", "name_key", "hex", "created_at", "updated_at")
SELECT gen_random_uuid(),
       btrim(elem->>'name'),
       lower(btrim(elem->>'name')),
       NULLIF(btrim(elem->>'hex'), ''),
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
FROM "automobile_vehicles" AS vehicle
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN jsonb_typeof(vehicle."available_colors") = 'array' THEN vehicle."available_colors"
    ELSE '[]'::jsonb
  END
) AS elem
WHERE btrim(COALESCE(elem->>'name', '')) <> ''
ON CONFLICT ("name_key") DO NOTHING;

INSERT INTO "automobile_vehicle_colors" ("vehicle_id", "color_id", "sort_order")
SELECT vehicle."id",
       color."id",
       (ordinality - 1)::integer
FROM "automobile_vehicles" AS vehicle
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN jsonb_typeof(vehicle."available_colors") = 'array' THEN vehicle."available_colors"
    ELSE '[]'::jsonb
  END
) WITH ORDINALITY AS expanded(elem, ordinality)
JOIN "automobile_colors" AS color
  ON color."name_key" = lower(btrim(elem->>'name'))
WHERE btrim(COALESCE(elem->>'name', '')) <> ''
ON CONFLICT ("vehicle_id", "color_id") DO NOTHING;
