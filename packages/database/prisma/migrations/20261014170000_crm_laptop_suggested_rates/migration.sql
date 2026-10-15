-- One-month rates set to the top of the suggested range.
-- 3, 6, 9, and 12 month prices are calculated from these rates
-- at 5%, 10%, 15%, and 20% off.
UPDATE "crm_laptops" AS laptop
SET
  "monthly_rate" = price.rate,
  "commitment_rate" = price.rate,
  "updated_at" = NOW()
FROM (
  VALUES
    ('ASUS Vivobook 16 M1605 Ryzen 7', 5500),
    ('ASUS Zenbook 14 UM3406 Ryzen AI 5', 5500),
    ('Acer Aspire 7 Gaming A715-79G RTX 4050', 6500),
    ('Acer Aspire Go AMD Ryzen 5', 3500),
    ('Acer Nitro V 15 ANV15-52 RTX 5050', 6500),
    ('Dell Latitude 5450 (2024) - i3 16GB', 3500),
    ('Dell Latitude 5450 (2024) - i5 16GB', 4200),
    ('Dell Latitude 5450 (2024) - i7 16GB', 5000),
    ('Dell Pro 14 (2025) - i3 16GB', 3800),
    ('Dell Pro 14 (2025) - i5 16GB', 4700),
    ('Dell Pro 14 (2025) - i7 16GB', 5500),
    ('Dell Pro 14 (2026) - i3 16GB', 4500),
    ('Dell Pro 14 (2026) - i5 16GB', 5300),
    ('Dell Pro 14 (2026) - i7 16GB', 6500),
    ('Lenovo IdeaPad 1', 3500),
    ('Lenovo IdeaPad Slim 5i 14 Core 5', 4800),
    ('Lenovo V15 G4', 4200)
) AS price(name, rate)
WHERE laptop."name" = price.name
  AND laptop."deleted_at" IS NULL;
