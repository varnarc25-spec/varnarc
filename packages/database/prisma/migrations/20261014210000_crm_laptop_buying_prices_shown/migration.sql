-- Buying prices for the laptops shown on 14 October 2026.
-- Amazon.in buy-box prices were read from the product page.
-- The Aspire 7 price is the Acer India store special price for that configuration.
UPDATE "crm_laptops" AS laptop
SET "buying_price" = price.amount, "updated_at" = NOW()
FROM (VALUES
  ('dell-pro-14-2025-i5-16gb', 169990),
  ('rentlap-asus-zenbook-14-um3406-for-rent', 124990),
  ('rentlap-acer-aspire-7-rtx-4050-for-rent', 94990)
) AS price(slug, amount)
WHERE laptop.slug = price.slug
  AND laptop.deleted_at IS NULL;
