-- India retail buying prices from Amazon.in on 14 October 2026.
-- A price is stored only when the listing matches the model, processor, memory, and storage.
-- Monthly rental rates are unchanged.
UPDATE "crm_laptops" AS laptop
SET "buying_price" = price.amount, "updated_at" = NOW()
FROM (VALUES
  ('rentlap-asus-rog-strix-g16-g614ph-rv033ws', 233990),
  ('rentlap-asus-vivobook-go-15-e1504fa-bq2414ws', 71000),
  ('rentlap-acer-aspire-one-a114-for-rent', 28990),
  ('rentlap-acer-nitro-v15-rtx-5050-for-rent', 135990),
  ('rentlap-acer-travellite-business-laptop-intel', 69990),
  ('rentlap-alienware-16-aurora-ac16250-core-7-gaming-laptop-for-rent', 174999),
  ('rentlap-dell-15-dc15250-13th-gen-i5-for-rent', 68490),
  ('rentlap-dell-16-laptop-dc16250', 108999),
  ('rentlap-hp-omnibook-x-flip-14-core-ultra-7-for-rent', 180400),
  ('hp-victus-rtx-3050', 102990),
  ('hp-victus-rtx-4050', 117990),
  ('hp-victus-i7-rtx-4050', 142990),
  ('ideapad-slim-3-2023-i7', 77990),
  ('rentlap-lenovo-ideapad1-amd-ryzen5-5500u-laptop-on-rent', 55499),
  ('lenovo-loq-rtx-3050', 98750),
  ('rentlap-lenovo-thinkpad-p14s-amd-gen-6-for-rent', 289990),
  ('rentlap-lenovo-thinkpad-x9-14-aura-edition-gen-1-for-rent', 251990),
  ('lenovo-v15-2023-i3', 52490),
  ('rentlap-lenovo-v15-g4-amd-ryzen-5-laptop-on-rent', 58990)
) AS price(slug, amount)
WHERE laptop.slug = price.slug
  AND laptop.deleted_at IS NULL;
