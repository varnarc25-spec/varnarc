ALTER TABLE "automobile_vehicles" ADD COLUMN IF NOT EXISTS "catalog_variant_id" UUID;

-- CreateTable
CREATE TABLE "automobile_car_models" (
    "id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "generation" TEXT,
    "facelift" TEXT,
    "launch_year" INTEGER,
    "discontinued_year" INTEGER,
    "body_type" TEXT,
    "vehicle_segment" TEXT,
    "description" TEXT,
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "automobile_car_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_catalog_variants" (
    "id" UUID NOT NULL,
    "model_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "variant_code" TEXT,
    "model_year" INTEGER,
    "launch_date" DATE,
    "discontinued_date" DATE,
    "fuel_type" TEXT,
    "transmission_type" TEXT,
    "drivetrain" TEXT,
    "ex_showroom_price" DECIMAL(14,2),
    "status" "publish_status" NOT NULL DEFAULT 'DRAFT',
    "seo_title" TEXT,
    "seo_description" TEXT,
    "source_name" TEXT,
    "source_url" TEXT,
    "source_date" DATE,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "automobile_catalog_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_engine_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "engine_type" TEXT,
    "engine_name" TEXT,
    "engine_code" TEXT,
    "displacement_cc" DECIMAL(10,2),
    "cylinders" INTEGER,
    "valves_per_cylinder" INTEGER,
    "total_valves" INTEGER,
    "aspiration" TEXT,
    "fuel_system" TEXT,
    "max_power_bhp" DECIMAL(8,2),
    "max_power_kw" DECIMAL(8,2),
    "max_power_rpm" INTEGER,
    "max_torque_nm" DECIMAL(8,2),
    "max_torque_rpm" INTEGER,
    "compression_ratio" TEXT,
    "bore_mm" DECIMAL(8,2),
    "stroke_mm" DECIMAL(8,2),
    "start_stop" BOOLEAN,
    "turbocharger" BOOLEAN,
    "supercharger" BOOLEAN,
    "source_name" TEXT,
    "source_url" TEXT,
    "source_date" DATE,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_engine_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_ev_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "battery_capacity_kwh" DECIMAL(8,2),
    "usable_battery_capacity_kwh" DECIMAL(8,2),
    "battery_type" TEXT,
    "battery_warranty_years" INTEGER,
    "battery_warranty_km" INTEGER,
    "motor_power_kw" DECIMAL(8,2),
    "motor_power_bhp" DECIMAL(8,2),
    "motor_torque_nm" DECIMAL(8,2),
    "range_claimed_km" INTEGER,
    "range_real_world_km" INTEGER,
    "charging_type" TEXT,
    "ac_charging_kw" DECIMAL(8,2),
    "dc_fast_charging_kw" DECIMAL(8,2),
    "charging_time_ac" TEXT,
    "charging_time_dc" TEXT,
    "dc_charge_time_10_80" TEXT,
    "regenerative_braking" BOOLEAN,
    "charging_connector" TEXT,
    "source_name" TEXT,
    "source_url" TEXT,
    "source_date" DATE,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_ev_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_fuel_economy" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "claimed_mileage" DECIMAL(8,2),
    "city_mileage" DECIMAL(8,2),
    "highway_mileage" DECIMAL(8,2),
    "real_world_mileage" DECIMAL(8,2),
    "claimed_range" DECIMAL(8,2),
    "mileage_unit" TEXT NOT NULL DEFAULT 'km/l',
    "fuel_tank_capacity_litre" DECIMAL(8,2),
    "energy_consumption_kwh_100km" DECIMAL(8,2),
    "emission_standard" TEXT,
    "co2_emission_g_km" DECIMAL(8,2),
    "source_name" TEXT,
    "source_url" TEXT,
    "source_date" DATE,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_fuel_economy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_performance_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "top_speed_kmph" DECIMAL(8,2),
    "acceleration_0_100_kmph" DECIMAL(8,2),
    "acceleration_0_60_kmph" DECIMAL(8,2),
    "quarter_mile" DECIMAL(8,2),
    "braking_100_0_kmph" DECIMAL(8,2),
    "power_to_weight_ratio" DECIMAL(10,4),
    "torque_to_weight_ratio" DECIMAL(10,4),
    "source_name" TEXT,
    "source_url" TEXT,
    "source_date" DATE,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_performance_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_dimension_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "length_mm" INTEGER,
    "width_mm" INTEGER,
    "height_mm" INTEGER,
    "wheelbase_mm" INTEGER,
    "ground_clearance_mm" INTEGER,
    "kerb_weight_kg" INTEGER,
    "gross_weight_kg" INTEGER,
    "boot_space_litre" INTEGER,
    "boot_space_seats_folded_litre" INTEGER,
    "fuel_tank_capacity_litre" DECIMAL(8,2),
    "turning_radius_m" DECIMAL(6,2),
    "seating_capacity" INTEGER,
    "number_of_doors" INTEGER,
    "source_name" TEXT,
    "source_url" TEXT,
    "source_date" DATE,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_dimension_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_chassis_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "front_suspension" TEXT,
    "rear_suspension" TEXT,
    "front_suspension_type" TEXT,
    "rear_suspension_type" TEXT,
    "front_brake_type" TEXT,
    "rear_brake_type" TEXT,
    "parking_brake_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_chassis_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_steering_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "steering_type" TEXT,
    "steering_assistance" TEXT,
    "steering_adjustment" TEXT,
    "steering_turns" DECIMAL(6,2),
    "minimum_turning_radius" DECIMAL(6,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_steering_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_wheel_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "wheel_size_inches" DECIMAL(6,2),
    "wheel_material" TEXT,
    "tyre_size_front" TEXT,
    "tyre_size_rear" TEXT,
    "spare_wheel_size" TEXT,
    "spare_wheel_type" TEXT,
    "tyre_profile" TEXT,
    "tyre_width" TEXT,
    "alloy_wheels" BOOLEAN,
    "run_flat_tyres" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_wheel_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_lighting_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "headlamp_type" TEXT,
    "headlamp_projector" BOOLEAN,
    "headlamp_led" BOOLEAN,
    "headlamp_matrix_led" BOOLEAN,
    "adaptive_headlights" BOOLEAN,
    "automatic_high_beam" BOOLEAN,
    "daytime_running_lights" BOOLEAN,
    "fog_lamp_type" TEXT,
    "tail_lamp_type" TEXT,
    "ambient_lighting" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_lighting_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_connectivity_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "connected_car" BOOLEAN,
    "mobile_app" BOOLEAN,
    "gps" BOOLEAN,
    "vehicle_tracking" BOOLEAN,
    "geofencing" BOOLEAN,
    "remote_lock_unlock" BOOLEAN,
    "remote_horn" BOOLEAN,
    "remote_light" BOOLEAN,
    "remote_vehicle_status" BOOLEAN,
    "emergency_assistance" BOOLEAN,
    "stolen_vehicle_tracking" BOOLEAN,
    "esim" BOOLEAN,
    "wifi_hotspot" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_connectivity_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_warranty_specs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "standard_warranty_years" INTEGER,
    "standard_warranty_km" INTEGER,
    "engine_warranty_years" INTEGER,
    "engine_warranty_km" INTEGER,
    "battery_warranty_years" INTEGER,
    "battery_warranty_km" INTEGER,
    "extended_warranty" BOOLEAN,
    "warranty_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_warranty_specs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_ownership_costs" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "estimated_annual_service_cost" DECIMAL(12,2),
    "service_interval_km" INTEGER,
    "service_interval_months" INTEGER,
    "warranty_years" INTEGER,
    "warranty_km" INTEGER,
    "extended_warranty_available" BOOLEAN,
    "roadside_assistance" BOOLEAN,
    "roadside_assistance_years" INTEGER,
    "insurance_estimate" DECIMAL(12,2),
    "tyre_cost" DECIMAL(12,2),
    "battery_cost" DECIMAL(12,2),
    "brake_pad_cost" DECIMAL(12,2),
    "estimated_maintenance_5_year" DECIMAL(12,2),
    "estimated_fuel_cost_annual" DECIMAL(12,2),
    "estimated_ev_charging_cost_annual" DECIMAL(12,2),
    "source" TEXT,
    "source_date" DATE,
    "assumptions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_ownership_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_safety_ratings" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "ncap_rating" DECIMAL(3,1),
    "ncap_rating_body" TEXT,
    "ncap_adult_occupant_score" DECIMAL(6,2),
    "ncap_child_occupant_score" DECIMAL(6,2),
    "ncap_safety_assist_score" DECIMAL(6,2),
    "ncap_year" INTEGER,
    "rating_agency" TEXT,
    "source_name" TEXT,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_safety_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_variant_prices" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "ex_showroom_price" DECIMAL(14,2),
    "base_price" DECIMAL(14,2),
    "top_price" DECIMAL(14,2),
    "city" TEXT,
    "state" TEXT,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "price_source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automobile_variant_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_on_road_prices" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "ex_showroom" DECIMAL(14,2),
    "road_tax" DECIMAL(14,2),
    "registration_fee" DECIMAL(14,2),
    "insurance" DECIMAL(65,30),
    "fastag" DECIMAL(65,30),
    "handling_charges" DECIMAL(14,2),
    "accessories" DECIMAL(65,30),
    "other_charges" DECIMAL(14,2),
    "discounts" DECIMAL(65,30),
    "on_road_price" DECIMAL(14,2),
    "effective_from" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automobile_on_road_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_feature_categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_feature_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_features" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "unit" TEXT,
    "description" TEXT,
    "comparison_enabled" BOOLEAN NOT NULL DEFAULT true,
    "filter_enabled" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_variant_features" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "feature_id" UUID NOT NULL,
    "value" TEXT,
    "numeric_value" DECIMAL(14,4),
    "boolean_value" BOOLEAN,
    "display_value" TEXT,
    "unit" TEXT,
    "source" TEXT,
    "source_date" DATE,

    CONSTRAINT "automobile_variant_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_catalog_images" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_type" TEXT NOT NULL DEFAULT 'Other',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automobile_catalog_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_used_vehicles" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "seller_id" UUID,
    "registration_number" TEXT,
    "registration_date" DATE,
    "manufacturing_date" DATE,
    "vin" TEXT,
    "engine_number" TEXT,
    "chassis_number" TEXT,
    "color" TEXT,
    "odometer_km" INTEGER,
    "owner_count" INTEGER,
    "insurance_expiry" DATE,
    "puc_expiry" DATE,
    "rc_status" TEXT,
    "loan_status" TEXT,
    "accident_history" BOOLEAN,
    "service_history_available" BOOLEAN,
    "service_history_type" TEXT,
    "vehicle_condition" TEXT,
    "asking_price" DECIMAL(14,2),
    "negotiable" BOOLEAN NOT NULL DEFAULT true,
    "city" TEXT,
    "locality" TEXT,
    "pincode" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "listing_status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "automobile_used_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_used_conditions" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "overall_condition" TEXT,
    "exterior_condition" TEXT,
    "interior_condition" TEXT,
    "engine_condition" TEXT,
    "transmission_condition" TEXT,
    "suspension_condition" TEXT,
    "tyre_condition" TEXT,
    "brake_condition" TEXT,
    "electrical_condition" TEXT,
    "ac_condition" TEXT,
    "accident_history" BOOLEAN,
    "flood_damage" BOOLEAN,
    "fire_damage" BOOLEAN,
    "major_repair" BOOLEAN,
    "repainting" BOOLEAN,
    "panel_replacement" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automobile_used_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_used_service_history" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "service_date" DATE NOT NULL,
    "service_km" INTEGER,
    "service_center" TEXT,
    "service_type" TEXT NOT NULL,
    "amount" DECIMAL(12,2),
    "description" TEXT,
    "invoice_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automobile_used_service_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_used_documents" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_url" TEXT,
    "document_number" TEXT,
    "issue_date" DATE,
    "expiry_date" DATE,
    "verification_status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automobile_used_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automobile_used_images" (
    "id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "image_type" TEXT NOT NULL DEFAULT 'Other',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automobile_used_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automobile_car_models_brand_id_status_idx" ON "automobile_car_models"("brand_id", "status");

-- CreateIndex
CREATE INDEX "automobile_car_models_body_type_idx" ON "automobile_car_models"("body_type");

-- CreateIndex
CREATE INDEX "automobile_car_models_vehicle_segment_idx" ON "automobile_car_models"("vehicle_segment");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_car_models_brand_id_slug_key" ON "automobile_car_models"("brand_id", "slug");

-- CreateIndex
CREATE INDEX "automobile_catalog_variants_model_id_status_idx" ON "automobile_catalog_variants"("model_id", "status");

-- CreateIndex
CREATE INDEX "automobile_catalog_variants_fuel_type_idx" ON "automobile_catalog_variants"("fuel_type");

-- CreateIndex
CREATE INDEX "automobile_catalog_variants_transmission_type_idx" ON "automobile_catalog_variants"("transmission_type");

-- CreateIndex
CREATE INDEX "automobile_catalog_variants_drivetrain_idx" ON "automobile_catalog_variants"("drivetrain");

-- CreateIndex
CREATE INDEX "automobile_catalog_variants_ex_showroom_price_idx" ON "automobile_catalog_variants"("ex_showroom_price");

-- CreateIndex
CREATE INDEX "automobile_catalog_variants_model_year_idx" ON "automobile_catalog_variants"("model_year");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_catalog_variants_model_id_slug_key" ON "automobile_catalog_variants"("model_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_engine_specs_variant_id_key" ON "automobile_engine_specs"("variant_id");

-- CreateIndex
CREATE INDEX "automobile_engine_specs_displacement_cc_idx" ON "automobile_engine_specs"("displacement_cc");

-- CreateIndex
CREATE INDEX "automobile_engine_specs_max_power_bhp_idx" ON "automobile_engine_specs"("max_power_bhp");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_ev_specs_variant_id_key" ON "automobile_ev_specs"("variant_id");

-- CreateIndex
CREATE INDEX "automobile_ev_specs_battery_capacity_kwh_idx" ON "automobile_ev_specs"("battery_capacity_kwh");

-- CreateIndex
CREATE INDEX "automobile_ev_specs_range_claimed_km_idx" ON "automobile_ev_specs"("range_claimed_km");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_fuel_economy_variant_id_key" ON "automobile_fuel_economy"("variant_id");

-- CreateIndex
CREATE INDEX "automobile_fuel_economy_claimed_mileage_idx" ON "automobile_fuel_economy"("claimed_mileage");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_performance_specs_variant_id_key" ON "automobile_performance_specs"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_dimension_specs_variant_id_key" ON "automobile_dimension_specs"("variant_id");

-- CreateIndex
CREATE INDEX "automobile_dimension_specs_seating_capacity_idx" ON "automobile_dimension_specs"("seating_capacity");

-- CreateIndex
CREATE INDEX "automobile_dimension_specs_ground_clearance_mm_idx" ON "automobile_dimension_specs"("ground_clearance_mm");

-- CreateIndex
CREATE INDEX "automobile_dimension_specs_boot_space_litre_idx" ON "automobile_dimension_specs"("boot_space_litre");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_chassis_specs_variant_id_key" ON "automobile_chassis_specs"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_steering_specs_variant_id_key" ON "automobile_steering_specs"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_wheel_specs_variant_id_key" ON "automobile_wheel_specs"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_lighting_specs_variant_id_key" ON "automobile_lighting_specs"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_connectivity_specs_variant_id_key" ON "automobile_connectivity_specs"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_warranty_specs_variant_id_key" ON "automobile_warranty_specs"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_ownership_costs_variant_id_key" ON "automobile_ownership_costs"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_safety_ratings_variant_id_key" ON "automobile_safety_ratings"("variant_id");

-- CreateIndex
CREATE INDEX "automobile_safety_ratings_ncap_rating_idx" ON "automobile_safety_ratings"("ncap_rating");

-- CreateIndex
CREATE INDEX "automobile_variant_prices_variant_id_city_effective_from_idx" ON "automobile_variant_prices"("variant_id", "city", "effective_from");

-- CreateIndex
CREATE INDEX "automobile_variant_prices_ex_showroom_price_idx" ON "automobile_variant_prices"("ex_showroom_price");

-- CreateIndex
CREATE INDEX "automobile_on_road_prices_variant_id_city_idx" ON "automobile_on_road_prices"("variant_id", "city");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_feature_categories_slug_key" ON "automobile_feature_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_features_slug_key" ON "automobile_features"("slug");

-- CreateIndex
CREATE INDEX "automobile_features_category_id_display_order_idx" ON "automobile_features"("category_id", "display_order");

-- CreateIndex
CREATE INDEX "automobile_features_filter_enabled_status_idx" ON "automobile_features"("filter_enabled", "status");

-- CreateIndex
CREATE INDEX "automobile_variant_features_feature_id_numeric_value_idx" ON "automobile_variant_features"("feature_id", "numeric_value");

-- CreateIndex
CREATE INDEX "automobile_variant_features_feature_id_boolean_value_idx" ON "automobile_variant_features"("feature_id", "boolean_value");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_variant_features_variant_id_feature_id_key" ON "automobile_variant_features"("variant_id", "feature_id");

-- CreateIndex
CREATE INDEX "automobile_catalog_images_variant_id_display_order_idx" ON "automobile_catalog_images"("variant_id", "display_order");

-- CreateIndex
CREATE INDEX "automobile_used_vehicles_variant_id_listing_status_idx" ON "automobile_used_vehicles"("variant_id", "listing_status");

-- CreateIndex
CREATE INDEX "automobile_used_vehicles_city_listing_status_idx" ON "automobile_used_vehicles"("city", "listing_status");

-- CreateIndex
CREATE INDEX "automobile_used_vehicles_asking_price_idx" ON "automobile_used_vehicles"("asking_price");

-- CreateIndex
CREATE INDEX "automobile_used_vehicles_created_at_idx" ON "automobile_used_vehicles"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "automobile_used_conditions_vehicle_id_key" ON "automobile_used_conditions"("vehicle_id");

-- CreateIndex
CREATE INDEX "automobile_used_service_history_vehicle_id_service_date_idx" ON "automobile_used_service_history"("vehicle_id", "service_date");

-- CreateIndex
CREATE INDEX "automobile_used_documents_vehicle_id_idx" ON "automobile_used_documents"("vehicle_id");

-- CreateIndex
CREATE INDEX "automobile_used_images_vehicle_id_display_order_idx" ON "automobile_used_images"("vehicle_id", "display_order");

CREATE INDEX "automobile_vehicles_catalog_variant_id_idx" ON "automobile_vehicles"("catalog_variant_id");


-- AddForeignKey
ALTER TABLE "automobile_vehicles" ADD CONSTRAINT "automobile_vehicles_catalog_variant_id_fkey" FOREIGN KEY ("catalog_variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_car_models" ADD CONSTRAINT "automobile_car_models_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "automobile_manufacturers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_catalog_variants" ADD CONSTRAINT "automobile_catalog_variants_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "automobile_car_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_engine_specs" ADD CONSTRAINT "automobile_engine_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_ev_specs" ADD CONSTRAINT "automobile_ev_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_fuel_economy" ADD CONSTRAINT "automobile_fuel_economy_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_performance_specs" ADD CONSTRAINT "automobile_performance_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_dimension_specs" ADD CONSTRAINT "automobile_dimension_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_chassis_specs" ADD CONSTRAINT "automobile_chassis_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_steering_specs" ADD CONSTRAINT "automobile_steering_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_wheel_specs" ADD CONSTRAINT "automobile_wheel_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_lighting_specs" ADD CONSTRAINT "automobile_lighting_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_connectivity_specs" ADD CONSTRAINT "automobile_connectivity_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_warranty_specs" ADD CONSTRAINT "automobile_warranty_specs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_ownership_costs" ADD CONSTRAINT "automobile_ownership_costs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_safety_ratings" ADD CONSTRAINT "automobile_safety_ratings_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_variant_prices" ADD CONSTRAINT "automobile_variant_prices_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_on_road_prices" ADD CONSTRAINT "automobile_on_road_prices_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_features" ADD CONSTRAINT "automobile_features_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "automobile_feature_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_variant_features" ADD CONSTRAINT "automobile_variant_features_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_variant_features" ADD CONSTRAINT "automobile_variant_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "automobile_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_catalog_images" ADD CONSTRAINT "automobile_catalog_images_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_used_vehicles" ADD CONSTRAINT "automobile_used_vehicles_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "automobile_catalog_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_used_conditions" ADD CONSTRAINT "automobile_used_conditions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "automobile_used_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_used_service_history" ADD CONSTRAINT "automobile_used_service_history_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "automobile_used_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_used_documents" ADD CONSTRAINT "automobile_used_documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "automobile_used_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automobile_used_images" ADD CONSTRAINT "automobile_used_images_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "automobile_used_vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
