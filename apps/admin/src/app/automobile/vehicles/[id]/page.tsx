import Link from 'next/link';
import { Badge, Card, CardDescription, CardHeader, CardTitle, PageHeader } from '@varnarc/ui';
import {
  AutomobileVehicleEditForm,
  AutomobileVehicleReviewLinker,
  AutomobileVersionHistory,
  type BrochureDetails,
  type CatalogColor,
} from '@/components/automobile-forms';
import { AutomobileMarketPricing } from '@/components/automobile-market-pricing';
import { apiServerFetch } from '@/lib/api';

type VehicleDetail = {
  id: string;
  name: string;
  status: string;
  model: string;
  variant?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  engineCapacity?: string | null;
  horsepower?: number | string | null;
  torque?: number | string | null;
  mileage?: number | string | null;
  seatingCapacity?: number | string | null;
  warranty?: string | null;
  category?: string | null;
  specifications?: { brochure?: BrochureDetails | null } | null;
  vehicleColors?: Array<{ color?: CatalogColor | null }>;
  imageUrl?: string | null;
  brochureUrl?: string | null;
  brochureMediaId?: string | null;
  images?: Array<{ mediaId?: string | null; imageUrl?: string | null }>;
  exShowroomPrice?: number | string | null;
  estimatedOnRoadPrice?: number | string | null;
  affiliateUrl?: string | null;
  description?: string | null;
  featured?: boolean;
  sponsored?: boolean;
  availableInIndia?: boolean;
  availableColors?: Array<{ name?: string; hex?: string | null }> | null;
  colors?: CatalogColor[];
  manufacturerId?: string | null;
  manufacturer?: { id: string; name: string } | null;
  reviewLinks?: Array<{ reviewId: string }>;
};

type ManufacturerRow = { id: string; name: string };

export default async function AutomobileVehicleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vehicleResult, manufacturersResult, colorsResult] = await Promise.all([
    apiServerFetch<VehicleDetail>(`/automobile/vehicles/${id}`),
    apiServerFetch<ManufacturerRow[]>('/automobile/admin/manufacturers/options'),
    apiServerFetch<CatalogColor[]>('/automobile/admin/colors'),
  ]);
  const vehicle = vehicleResult.data;
  const manufacturers = Array.isArray(manufacturersResult.data) ? manufacturersResult.data : [];
  const colors = Array.isArray(colorsResult.data) ? colorsResult.data : [];
  const linkedColors =
    vehicle?.colors ??
    vehicle?.vehicleColors?.flatMap((link) => (link.color ? [link.color] : [])) ??
    [];
  const linkedIds = linkedColors.map((color) => color.id);
  const fallbackIds =
    linkedIds.length > 0
      ? linkedIds
      : colors
          .filter((color) =>
            (vehicle?.availableColors ?? []).some(
              (item) => item.name?.trim().toLowerCase() === color.name.trim().toLowerCase(),
            ),
          )
          .map((color) => color.id);

  return (
    <div>
      <PageHeader
        title="Edit vehicle"
        description={vehicle?.name ?? 'Vehicle'}
        actions={
          <Link
            href="/automobile/vehicles"
            className="text-sm text-[var(--varnarc-brand)] hover:underline"
          >
            ← Back to vehicles
          </Link>
        }
      />

      {vehicleResult.error || !vehicle ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load vehicle</CardTitle>
            <CardDescription>{vehicleResult.error || 'Not found'}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>{vehicle.status}</Badge>
            {vehicle.featured ? <Badge>Featured</Badge> : null}
            {vehicle.sponsored ? <Badge>Sponsored</Badge> : null}
            {vehicle.availableInIndia ? <Badge>India</Badge> : <Badge>Not India</Badge>}
          </div>
          <AutomobileVehicleEditForm
            id={vehicle.id}
            manufacturers={manufacturers}
            colors={colors}
            initial={{
              manufacturerId: vehicle.manufacturerId ?? vehicle.manufacturer?.id,
              name: vehicle.name,
              model: vehicle.model,
              variant: vehicle.variant,
              fuelType: vehicle.fuelType,
              transmission: vehicle.transmission,
              engineCapacity: vehicle.engineCapacity,
              horsepower: vehicle.horsepower,
              torque: vehicle.torque,
              mileage: vehicle.mileage,
              seatingCapacity: vehicle.seatingCapacity,
              warranty: vehicle.warranty,
              brochure: vehicle.specifications?.brochure,
              specifications: vehicle.specifications,
              category: vehicle.category,
              imageUrl: vehicle.imageUrl,
              brochureUrl: vehicle.brochureUrl,
              brochureMediaId: vehicle.brochureMediaId,
              galleryItems: (vehicle.images ?? []).map((img) => ({
                mediaId: img.mediaId,
                imageUrl: img.imageUrl,
                previewUrl: img.imageUrl,
              })),
              exShowroomPrice: vehicle.exShowroomPrice,
              estimatedOnRoadPrice: vehicle.estimatedOnRoadPrice,
              affiliateUrl: vehicle.affiliateUrl,
              description: vehicle.description,
              featured: vehicle.featured,
              sponsored: vehicle.sponsored,
              availableInIndia: vehicle.availableInIndia,
              colorIds: fallbackIds,
            }}
          />
          <AutomobileMarketPricing vehicleId={vehicle.id} />
          <AutomobileVehicleReviewLinker
            vehicleId={vehicle.id}
            initialReviewIds={(vehicle.reviewLinks ?? []).map((link) => link.reviewId)}
          />
          <AutomobileVersionHistory entity="automobile_vehicle" entityId={vehicle.id} />
        </>
      )}
    </div>
  );
}
