import { describe, expect, it } from 'vitest';
import {
  formatListingIndianPrice,
  formatListingPrice,
  getAvailabilityBadge,
  getDisplayVehicleName,
  getPrimaryVehicleImages,
  getVariantLabel,
} from '@/lib/automobile/listing-card';

describe('listing card presentation', () => {
  it('formats lakh and crore prices without inventing precision', () => {
    expect(formatListingIndianPrice(477000)).toBe('₹4.77 lakh');
    expect(formatListingIndianPrice(673000)).toBe('₹6.73 lakh');
    expect(formatListingIndianPrice(1099000)).toBe('₹10.99 lakh');
    expect(formatListingIndianPrice(5089000)).toBe('₹50.89 lakh');
    expect(formatListingIndianPrice(11999000)).toBe('₹1.20 crore');
    expect(formatListingIndianPrice(21775000)).toBe('₹2.18 crore');
    expect(formatListingIndianPrice(500000)).toBe('₹5 lakh');
    expect(formatListingIndianPrice(null)).toBeNull();
  });

  it('formats a stored price range and a missing price', () => {
    expect(formatListingPrice({ min: 477000, max: 862000 }).amount).toBe('₹4.77 – ₹8.62 lakh');
    expect(formatListingPrice({ min: 477000, max: 477000 })).toEqual({
      amount: '₹4.77 lakh*',
      caption: 'Starting ex-showroom',
    });
    expect(formatListingPrice({ min: null, max: null })).toEqual({
      amount: 'Price on request',
      caption: null,
    });
  });

  it('shows manufacturer and model without catalogue suffixes', () => {
    expect(
      getDisplayVehicleName({
        name: 'Tata Tiago 2026 India Range',
        model: 'Tiago 2026 India Range',
        manufacturerName: 'Tata',
      }),
    ).toBe('Tata Tiago');
    expect(
      getDisplayVehicleName({
        name: 'Nissan Magnite Global 2026',
        model: 'Magnite Global 2026',
        manufacturerName: 'Nissan',
      }),
    ).toBe('Nissan Magnite');
    expect(getVariantLabel('MT VISIA')).toBe('MT VISIA');
    expect(getVariantLabel('India Range')).toBeNull();
  });

  it('reads availability and the front image only from supplied data', () => {
    expect(getAvailabilityBadge({ launchStatus: 'EXPECTED' })).toBe('Upcoming');
    expect(getAvailabilityBadge({ marketStatus: 'CURRENT' })).toBe('Current');
    expect(getAvailabilityBadge({})).toBeNull();
    expect(
      getPrimaryVehicleImages({
        imageUrl: 'https://example.com/side.jpg',
        images: [
          { imageUrl: 'https://example.com/rear.jpg', altText: 'Rear' },
          { imageUrl: 'https://example.com/front.jpg', altText: 'Front three-quarter' },
        ],
      })[0]?.imageUrl,
    ).toBe('https://example.com/front.jpg');
    expect(getPrimaryVehicleImages({}).length).toBe(0);
  });
});
