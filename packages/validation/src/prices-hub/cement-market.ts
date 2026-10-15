/**
 * India cement manufacturers and third-party published bag rates.
 * Figures are copied as numbers from the cited pages (retrieved 16 Oct 2026).
 * They are retail references, not Varnarc-verified dealer quotes or MRPs.
 */

import { PRICE_HUB_CITY_DEFS } from '../construction-location-catalog';

export const CEMENT_MARKET_RETRIEVED_AT = '2026-10-16';

export const CEMENT_MARKET_QUALIFICATION =
  'Published retail references from the websites named on this page. Brand, grade, GST, credit and delivery change the landed bag rate. Confirm with a local dealer before buying. Varnarc does not sell cement.';

export type CementGrade = 'OPC 53' | 'OPC 43' | 'OPC 33' | 'PPC' | 'White' | 'market';

export type CementWebQuote = {
  id: string;
  sourceId: CementPriceSourceId;
  brandLabel: string;
  manufacturerSlug: string | null;
  grade: CementGrade;
  scope: 'national' | 'city';
  citySlug: string | null;
  cityName: string | null;
  unit: '50 kg bag' | '1 kg' | '5 kg';
  price: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  note: string | null;
};

export type CementPriceSourceId = 'dreamcivil' | 'homerun';

export type CementPriceSource = {
  id: CementPriceSourceId;
  name: string;
  url: string;
  retrievedAt: string;
  publishedLabel: string;
  note: string;
};

export const CEMENT_PRICE_SOURCES: readonly CementPriceSource[] = [
  {
    id: 'dreamcivil',
    name: 'Dream Civil',
    url: 'https://dreamcivil.com/cement-price-in-india-today/',
    retrievedAt: CEMENT_MARKET_RETRIEVED_AT,
    publishedLabel: '2026 price list',
    note: 'OPC brand rates and city bands published from their dealer network. Shown as published, including grade cells that disagree with the table heading.',
  },
  {
    id: 'homerun',
    name: 'HomeRun',
    url: 'https://home-run.co/pages/price-list/cement',
    retrievedAt: CEMENT_MARKET_RETRIEVED_AT,
    publishedLabel: 'Last updated 8 May 2026',
    note: 'Bengaluru shelf prices. The listing date is older than the October retrieval, so treat these as a dated shop list.',
  },
] as const;

export type CementManufacturer = {
  slug: string;
  name: string;
  group: string;
  website: string | null;
  coverage: string;
  products: string;
};

export const CEMENT_MANUFACTURERS: readonly CementManufacturer[] = [
  {
    slug: 'ultratech',
    name: 'UltraTech Cement',
    group: 'Aditya Birla Group',
    website: 'https://www.ultratechcement.com',
    coverage: 'Pan-India',
    products: 'OPC, PPC, PSC and white cement. Largest grey-cement producer in India.',
  },
  {
    slug: 'ambuja',
    name: 'Ambuja Cements',
    group: 'Adani',
    website: 'https://www.ambujacement.com',
    coverage: '31 states and union territories',
    products: 'OPC and PPC. Parent of ACC; Adani Cement brands include Ambuja, ACC and Orient.',
  },
  {
    slug: 'acc',
    name: 'ACC',
    group: 'Adani / Ambuja Cements',
    website: 'https://www.acclimited.com',
    coverage: 'Pan-India',
    products: 'OPC, PPC and ready-mix concrete.',
  },
  {
    slug: 'shree',
    name: 'Shree Cement',
    group: 'Shree Cement',
    website: 'https://www.shreecement.com',
    coverage: 'North, east and a widening national network',
    products: 'OPC and PPC. Retail brand Bangur. About 69 MTPA installed capacity in India.',
  },
  {
    slug: 'dalmia',
    name: 'Dalmia Cement',
    group: 'Dalmia Bharat',
    website: 'https://www.dalmiacement.com',
    coverage: 'East, south and expanding',
    products: 'OPC, PPC and specialty cements.',
  },
  {
    slug: 'ramco',
    name: 'Ramco Cements',
    group: 'Ramco Group',
    website: 'https://www.ramcocements.in',
    coverage: 'South India',
    products: 'OPC, PPC, ready-mix and dry mortar.',
  },
  {
    slug: 'nuvoco',
    name: 'Nuvoco Vistas',
    group: 'Nirma Group',
    website: 'https://www.nuvoco.in',
    coverage: 'East and north',
    products: 'OPC, PPC and premium blended cements.',
  },
  {
    slug: 'jk-cement',
    name: 'JK Cement',
    group: 'JK Organisation',
    website: 'https://www.jkcement.com',
    coverage: 'North, west and white-cement markets',
    products: 'Grey OPC/PPC and white cement.',
  },
  {
    slug: 'jk-lakshmi',
    name: 'JK Lakshmi Cement',
    group: 'JK Organisation',
    website: 'https://www.jklakshmicement.com',
    coverage: 'North and west',
    products: 'OPC, PPC and blended cements.',
  },
  {
    slug: 'birla',
    name: 'Birla Cement',
    group: 'MP Birla Group (Birla Corporation)',
    website: 'https://www.birlacorporation.com',
    coverage: 'Central and north India',
    products: 'OPC, PPC and Birla White (white cement is also sold as a separate product line).',
  },
  {
    slug: 'india-cements',
    name: 'India Cements',
    group: 'India Cements',
    website: 'https://www.indiacements.co.in',
    coverage: 'South India',
    products: 'OPC and PPC. Coromandel is a retail brand. UltraTech holds a controlling stake.',
  },
  {
    slug: 'jsw',
    name: 'JSW Cement',
    group: 'JSW Group',
    website: 'https://www.jswcement.in',
    coverage: 'West and south',
    products: 'PSC, PPC and slag-based cements.',
  },
  {
    slug: 'orient',
    name: 'Orient Cement',
    group: 'Ambuja Cements (Adani)',
    website: 'https://www.orientcement.com',
    coverage: 'West and south',
    products: 'OPC and PPC. Listed by Ambuja as an Adani Cement brand.',
  },
  {
    slug: 'heidelberg',
    name: 'HeidelbergCement India',
    group: 'Heidelberg Materials',
    website: 'https://www.mycemco.com',
    coverage: 'Central India',
    products: 'Mycem and Zuari grey cement.',
  },
  {
    slug: 'star',
    name: 'Star Cement',
    group: 'Star Cement',
    website: 'https://www.starcement.co.in',
    coverage: 'Northeast India',
    products: 'OPC and PPC.',
  },
  {
    slug: 'wonder',
    name: 'Wonder Cement',
    group: 'Wonder Cement',
    website: 'https://www.wondercement.com',
    coverage: 'North and west',
    products: 'OPC and PPC.',
  },
  {
    slug: 'sagar',
    name: 'Sagar Cements',
    group: 'Sagar Cements',
    website: 'https://www.sagarcements.in',
    coverage: 'South India',
    products: 'OPC and PPC.',
  },
  {
    slug: 'chettinad',
    name: 'Chettinad Cement',
    group: 'Chettinad Group',
    website: 'https://www.chettinad.com',
    coverage: 'Tamil Nadu and the south',
    products: 'OPC and PPC.',
  },
  {
    slug: 'prism',
    name: 'Prism Cement',
    group: 'Prism Johnson',
    website: 'https://www.prismjohnson.in',
    coverage: 'Central India',
    products: 'OPC and PPC.',
  },
  {
    slug: 'mangalam',
    name: 'Mangalam Cement',
    group: 'Mangalam Cement',
    website: 'https://www.mangalamcement.com',
    coverage: 'Rajasthan and nearby markets',
    products: 'OPC and PPC.',
  },
  {
    slug: 'saurashtra',
    name: 'Saurashtra Cement',
    group: 'Saurashtra Cement',
    website: 'https://www.saurashtracement.com',
    coverage: 'Gujarat',
    products: 'Hathi brand OPC and PPC.',
  },
  {
    slug: 'deccan',
    name: 'Deccan Cements',
    group: 'Deccan Cements',
    website: 'https://www.deccancements.com',
    coverage: 'Telangana',
    products: 'OPC and PPC.',
  },
  {
    slug: 'maha',
    name: 'Maha Cement',
    group: 'My Home Industries',
    website: 'https://www.mahacement.com',
    coverage: 'South India',
    products: 'OPC and PPC.',
  },
  {
    slug: 'jaypee',
    name: 'Jaypee Cement',
    group: 'Jaypee Group',
    website: 'https://www.jalindia.com',
    coverage: 'Residual markets after earlier plant sales',
    products: 'OPC. A large part of the former Jaypee cement capacity was sold to UltraTech.',
  },
  {
    slug: 'ncl',
    name: 'Nagarjuna Cement',
    group: 'NCL Industries',
    website: 'https://www.nclind.com',
    coverage: 'Andhra Pradesh and Telangana',
    products: 'OPC and PPC.',
  },
  {
    slug: 'kcp',
    name: 'KCP Cement',
    group: 'The KCP',
    website: 'https://www.kcp.co.in',
    coverage: 'Andhra Pradesh',
    products: 'OPC and PPC.',
  },
  {
    slug: 'sanghi',
    name: 'Sanghi Cement',
    group: 'Ambuja Cements (Adani)',
    website: 'https://www.sanghicement.com',
    coverage: 'Gujarat and west India',
    products: 'OPC and PPC. Capacity sits with Ambuja.',
  },
  {
    slug: 'priya',
    name: 'Priya Cement',
    group: 'Regional trade brand',
    website: null,
    coverage: 'Andhra Pradesh and Telangana',
    products: 'OPC 53 and PPC sold through local dealers.',
  },
] as const;

type BrandRate = {
  brandLabel: string;
  manufacturerSlug: string | null;
  price: number;
  note?: string;
};

const DREAM_BRANDS: Record<'OPC 53' | 'OPC 43' | 'OPC 33', BrandRate[]> = {
  'OPC 53': [
    { brandLabel: 'Ultratech Cement', manufacturerSlug: 'ultratech', price: 450 },
    { brandLabel: 'Ambuja Cement', manufacturerSlug: 'ambuja', price: 440 },
    { brandLabel: 'ACC Cement', manufacturerSlug: 'acc', price: 430 },
    { brandLabel: 'Birla Cement', manufacturerSlug: 'birla', price: 420 },
    { brandLabel: 'JK Lakshmi Cement', manufacturerSlug: 'jk-lakshmi', price: 420 },
    { brandLabel: 'Dalmia Cement', manufacturerSlug: 'dalmia', price: 400 },
    { brandLabel: 'Jaypee Cement', manufacturerSlug: 'jaypee', price: 390 },
    { brandLabel: 'Shree Cement', manufacturerSlug: 'shree', price: 420 },
    {
      brandLabel: 'Banger Cement',
      manufacturerSlug: 'shree',
      price: 400,
      note: 'Published spelling is “Banger”. Bangur is Shree Cement’s retail brand — confirm the bag name.',
    },
    {
      brandLabel: 'Coromandel Cement',
      manufacturerSlug: 'india-cements',
      price: 410,
      note: 'Coromandel is an India Cements retail brand.',
    },
    { brandLabel: 'Priya Cement', manufacturerSlug: 'priya', price: 390 },
    { brandLabel: 'Ramco Cement', manufacturerSlug: 'ramco', price: 430 },
    {
      brandLabel: 'Sanghi Cement',
      manufacturerSlug: 'sanghi',
      price: 390,
      note: 'Sanghi capacity is part of Ambuja Cements.',
    },
    {
      brandLabel: 'Hathi Cement',
      manufacturerSlug: 'saurashtra',
      price: 360,
      note: 'Hathi is the retail brand of Saurashtra Cement.',
    },
  ],
  'OPC 43': [
    { brandLabel: 'Ultratech Cement', manufacturerSlug: 'ultratech', price: 305 },
    { brandLabel: 'Ambuja Cement', manufacturerSlug: 'ambuja', price: 310 },
    { brandLabel: 'ACC Cement', manufacturerSlug: 'acc', price: 320 },
    { brandLabel: 'Birla Cement', manufacturerSlug: 'birla', price: 300 },
    { brandLabel: 'JK Lakshmi Cement', manufacturerSlug: 'jk-lakshmi', price: 280 },
    { brandLabel: 'Dalmia Cement', manufacturerSlug: 'dalmia', price: 305 },
    { brandLabel: 'Jaypee Cement', manufacturerSlug: 'jaypee', price: 320 },
    { brandLabel: 'Shree Cement', manufacturerSlug: 'shree', price: 290 },
    { brandLabel: 'Banger Cement', manufacturerSlug: 'shree', price: 260 },
    { brandLabel: 'Coromandel Cement', manufacturerSlug: 'india-cements', price: 350 },
    { brandLabel: 'Priya Cement', manufacturerSlug: 'priya', price: 320 },
    { brandLabel: 'Ramco Cement', manufacturerSlug: 'ramco', price: 315 },
    { brandLabel: 'Sanghi Cement', manufacturerSlug: 'sanghi', price: 325 },
    { brandLabel: 'Hathi Cement', manufacturerSlug: 'saurashtra', price: 360 },
  ],
  'OPC 33': [
    { brandLabel: 'Ultratech Cement', manufacturerSlug: 'ultratech', price: 280 },
    { brandLabel: 'Ambuja Cement', manufacturerSlug: 'ambuja', price: 290 },
    { brandLabel: 'ACC Cement', manufacturerSlug: 'acc', price: 275 },
    {
      brandLabel: 'Birla Cement',
      manufacturerSlug: 'birla',
      price: 310,
      note: 'Source grade cell reads “43 Grade OPC” inside the OPC 33 table.',
    },
    { brandLabel: 'JK Lakshmi Cement', manufacturerSlug: 'jk-lakshmi', price: 285 },
    { brandLabel: 'Dalmia Cement', manufacturerSlug: 'dalmia', price: 260 },
    { brandLabel: 'Jaypee Cement', manufacturerSlug: 'jaypee', price: 290 },
    { brandLabel: 'Shree Cement', manufacturerSlug: 'shree', price: 265 },
    {
      brandLabel: 'Banger Cement',
      manufacturerSlug: 'shree',
      price: 290,
      note: 'Source grade cell reads “43 Grade OPC” inside the OPC 33 table.',
    },
    { brandLabel: 'Coromandel Cement', manufacturerSlug: 'india-cements', price: 265 },
    { brandLabel: 'Priya Cement', manufacturerSlug: 'priya', price: 310 },
    { brandLabel: 'Ramco Cement', manufacturerSlug: 'ramco', price: 290 },
    { brandLabel: 'Sanghi Cement', manufacturerSlug: 'sanghi', price: 295 },
    { brandLabel: 'Hathi Cement', manufacturerSlug: 'saurashtra', price: 295 },
  ],
};

const DREAM_CITIES: Array<{
  cityName: string;
  citySlug: string;
  minPrice: number;
  maxPrice: number;
}> = [
  { cityName: 'Delhi', citySlug: 'delhi', minPrice: 385, maxPrice: 400 },
  { cityName: 'Mumbai', citySlug: 'mumbai', minPrice: 395, maxPrice: 415 },
  { cityName: 'Bengaluru', citySlug: 'bengaluru', minPrice: 390, maxPrice: 410 },
  { cityName: 'Chennai', citySlug: 'chennai', minPrice: 380, maxPrice: 395 },
  { cityName: 'Hyderabad', citySlug: 'hyderabad', minPrice: 385, maxPrice: 400 },
  { cityName: 'Kolkata', citySlug: 'kolkata', minPrice: 370, maxPrice: 385 },
  { cityName: 'Ahmedabad', citySlug: 'ahmedabad', minPrice: 375, maxPrice: 390 },
  { cityName: 'Pune', citySlug: 'pune', minPrice: 390, maxPrice: 410 },
  { cityName: 'Jaipur', citySlug: 'jaipur', minPrice: 370, maxPrice: 385 },
  { cityName: 'Lucknow', citySlug: 'lucknow', minPrice: 365, maxPrice: 380 },
];

function dreamBrandQuotes(grade: 'OPC 53' | 'OPC 43' | 'OPC 33'): CementWebQuote[] {
  return DREAM_BRANDS[grade].map((row) => ({
    id: `dreamcivil-${grade.toLowerCase().replace(/\s+/g, '')}-${row.manufacturerSlug ?? 'x'}-${row.brandLabel.toLowerCase().replace(/\s+/g, '-')}`,
    sourceId: 'dreamcivil' as const,
    brandLabel: row.brandLabel,
    manufacturerSlug: row.manufacturerSlug,
    grade,
    scope: 'national' as const,
    citySlug: null,
    cityName: null,
    unit: '50 kg bag' as const,
    price: row.price,
    minPrice: null,
    maxPrice: null,
    note: row.note ?? null,
  }));
}

function dreamCityQuotes(): CementWebQuote[] {
  return DREAM_CITIES.map((row) => ({
    id: `dreamcivil-city-${row.citySlug}`,
    sourceId: 'dreamcivil' as const,
    brandLabel: 'City band (all brands)',
    manufacturerSlug: null,
    grade: 'market' as const,
    scope: 'city' as const,
    citySlug: row.citySlug,
    cityName: row.cityName,
    unit: '50 kg bag' as const,
    price: null,
    minPrice: row.minPrice,
    maxPrice: row.maxPrice,
    note: null,
  }));
}

const HOMERUN: CementWebQuote[] = [
  quoteHome('maha-ppc', 'Maha PPC', 'maha', 'PPC', 360, 'Bulk ₹350 for 10 bags, ₹345 for 30.'),
  quoteHome(
    'acc-ppc',
    'ACC Suraksha Power PPC',
    'acc',
    'PPC',
    395,
    'Bulk ₹390 for 15 bags, ₹380 for 40.',
  ),
  quoteHome(
    'ut-ppc',
    'UltraTech PPC',
    'ultratech',
    'PPC',
    425,
    'Bulk ₹415 for 10 bags, ₹405 for 30.',
  ),
  quoteHome(
    'birla-white-1',
    'Birla White',
    'birla',
    'White',
    40,
    '1 kg pack. Published bulk column is ₹1,180 (min 15).',
    '1 kg',
  ),
  quoteHome(
    'birla-white-5',
    'Birla White',
    'birla',
    'White',
    140,
    '5 kg pack. Published bulk column is ₹1,180 (min 15).',
    '5 kg',
  ),
  quoteHome(
    'birla-white-50',
    'Birla White',
    'birla',
    'White',
    1200,
    '50 kg bag. Bulk ₹1,180 for 15 bags.',
  ),
  quoteHome(
    'priya-opc',
    'Priya OPC 53',
    'priya',
    'OPC 53',
    390,
    'Bulk ₹385 for 10 bags, ₹375 for 40.',
  ),
  quoteHome('priya-ppc', 'Priya PPC', 'priya', 'PPC', 360, 'Bulk ₹350 for 10 bags, ₹345 for 30.'),
  quoteHome(
    'maha-opc',
    'Maha OPC 53',
    'maha',
    'OPC 53',
    390,
    'Bulk ₹385 for 10 bags, ₹375 for 40.',
  ),
  quoteHome(
    'ramco-ppc',
    'Ramco Supergrade PPC',
    'ramco',
    'PPC',
    390,
    'Bulk ₹385 for 10 bags, ₹375 for 30.',
  ),
  quoteHome(
    'birla-opc',
    'Birla Super OPC 53',
    'birla',
    'OPC 53',
    460,
    'Bulk ₹450 for 15 bags, ₹435 for 40.',
  ),
  quoteHome(
    'ramco-opc',
    'Ramco OPC 53',
    'ramco',
    'OPC 53',
    430,
    'Bulk ₹420 for 10 bags, ₹410 for 40.',
  ),
];

function quoteHome(
  id: string,
  brandLabel: string,
  manufacturerSlug: string,
  grade: CementGrade,
  price: number,
  note: string,
  unit: CementWebQuote['unit'] = '50 kg bag',
): CementWebQuote {
  return {
    id: `homerun-${id}`,
    sourceId: 'homerun',
    brandLabel,
    manufacturerSlug,
    grade,
    scope: 'city',
    citySlug: 'bengaluru',
    cityName: 'Bengaluru',
    unit,
    price,
    minPrice: null,
    maxPrice: null,
    note,
  };
}

export const CEMENT_WEB_QUOTES: readonly CementWebQuote[] = [
  ...dreamBrandQuotes('OPC 53'),
  ...dreamBrandQuotes('OPC 43'),
  ...dreamBrandQuotes('OPC 33'),
  ...dreamCityQuotes(),
  ...HOMERUN,
];

export type CementQuoteStats = {
  count: number;
  average: number | null;
  low: number | null;
  high: number | null;
};

export function cementQuoteBounds(
  quote: Pick<CementWebQuote, 'price' | 'minPrice' | 'maxPrice'>,
): { low: number; high: number; mid: number } | null {
  if (quote.price != null && Number.isFinite(quote.price)) {
    return { low: quote.price, high: quote.price, mid: quote.price };
  }
  if (
    quote.minPrice != null &&
    quote.maxPrice != null &&
    Number.isFinite(quote.minPrice) &&
    Number.isFinite(quote.maxPrice)
  ) {
    return {
      low: quote.minPrice,
      high: quote.maxPrice,
      mid: (quote.minPrice + quote.maxPrice) / 2,
    };
  }
  return null;
}

export function summarizeCementQuotes(
  quotes: readonly Pick<CementWebQuote, 'price' | 'minPrice' | 'maxPrice'>[],
): CementQuoteStats {
  const bounds = quotes
    .map((quote) => cementQuoteBounds(quote))
    .filter((row): row is { low: number; high: number; mid: number } => row != null);
  if (!bounds.length) return { count: 0, average: null, low: null, high: null };
  const midSum = bounds.reduce((sum, row) => sum + row.mid, 0);
  return {
    count: bounds.length,
    average: Math.round(midSum / bounds.length),
    low: Math.min(...bounds.map((row) => row.low)),
    high: Math.max(...bounds.map((row) => row.high)),
  };
}

export type CementCityBand = {
  cityName: string;
  citySlug: string;
  minPrice: number;
  maxPrice: number;
  midpoint: number;
  hubPath: string | null;
  sourceName: string;
  sourceUrl: string;
};

export type CementManufacturerRow = CementManufacturer & {
  quotes: CementWebQuote[];
  opc53: CementQuoteStats;
};

export type CementSourceGroup = CementPriceSource & {
  quotes: CementWebQuote[];
  greyBag: CementQuoteStats;
};

export type CementNationalSnapshot = {
  retrievedAt: string;
  qualification: string;
  manufacturers: CementManufacturerRow[];
  opc53: CementQuoteStats;
  opc43: CementQuoteStats;
  opc33: CementQuoteStats;
  cities: CementCityBand[];
  citySummary: CementQuoteStats;
  sources: CementSourceGroup[];
  greyBagSpan: CementQuoteStats;
  faqs: Array<{ question: string; answer: string }>;
};

function inr(value: number | null): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildCementNationalSnapshot(
  quotes: readonly CementWebQuote[] = CEMENT_WEB_QUOTES,
): CementNationalSnapshot {
  const national = (grade: 'OPC 53' | 'OPC 43' | 'OPC 33') =>
    quotes.filter(
      (quote) => quote.grade === grade && quote.scope === 'national' && quote.unit === '50 kg bag',
    );
  const opc53 = summarizeCementQuotes(national('OPC 53'));
  const opc43 = summarizeCementQuotes(national('OPC 43'));
  const opc33 = summarizeCementQuotes(national('OPC 33'));

  const cities: CementCityBand[] = quotes
    .filter(
      (quote) =>
        quote.grade === 'market' && quote.scope === 'city' && quote.citySlug && quote.cityName,
    )
    .map((quote) => {
      const bounds = cementQuoteBounds(quote)!;
      const source = CEMENT_PRICE_SOURCES.find((item) => item.id === quote.sourceId)!;
      return {
        cityName: quote.cityName!,
        citySlug: quote.citySlug!,
        minPrice: bounds.low,
        maxPrice: bounds.high,
        midpoint: bounds.mid,
        hubPath: PRICE_HUB_CITY_DEFS.some((city) => city.slug === quote.citySlug)
          ? `/construction/prices/cement/${quote.citySlug}`
          : null,
        sourceName: source.name,
        sourceUrl: source.url,
      };
    })
    .sort((a, b) => a.midpoint - b.midpoint || a.cityName.localeCompare(b.cityName));

  const citySummary = summarizeCementQuotes(
    cities.map((city) => ({ price: null, minPrice: city.minPrice, maxPrice: city.maxPrice })),
  );

  const greyBags = quotes.filter((quote) => quote.unit === '50 kg bag' && quote.grade !== 'White');
  const greyBagSpan = summarizeCementQuotes(greyBags);

  const sources: CementSourceGroup[] = CEMENT_PRICE_SOURCES.map((source) => {
    const sourceQuotes = quotes.filter((quote) => quote.sourceId === source.id);
    return {
      ...source,
      quotes: sourceQuotes,
      greyBag: summarizeCementQuotes(
        sourceQuotes.filter((quote) => quote.unit === '50 kg bag' && quote.grade !== 'White'),
      ),
    };
  });

  const manufacturers: CementManufacturerRow[] = CEMENT_MANUFACTURERS.map((manufacturer) => {
    const manufacturerQuotes = quotes.filter(
      (quote) => quote.manufacturerSlug === manufacturer.slug,
    );
    return {
      ...manufacturer,
      quotes: manufacturerQuotes,
      opc53: summarizeCementQuotes(
        manufacturerQuotes.filter(
          (quote) => quote.grade === 'OPC 53' && quote.unit === '50 kg bag',
        ),
      ),
    };
  });

  const faqs = [
    {
      question: 'What is the average cement price in India?',
      answer: `Across ${cities.length} published city bands, the midpoint average is ${inr(citySummary.average)} per 50 kg bag, with city lows and highs spanning ${inr(citySummary.low)}–${inr(citySummary.high)}. The OPC 53 brand list averages ${inr(opc53.average)} (${inr(opc53.low)}–${inr(opc53.high)}). These are third-party published references, not one national MRP.`,
    },
    {
      question: 'Which cement manufacturers are listed?',
      answer: `The page lists ${CEMENT_MANUFACTURERS.length} manufacturers and retail brands that sell cement in India, including UltraTech, Ambuja, ACC, Shree, Dalmia, Ramco, Nuvoco, JK Cement, JK Lakshmi, Birla, India Cements, JSW, Orient, Heidelberg, Star, Wonder and regional producers. A bag rate is shown only when one of the cited websites published it.`,
    },
    {
      question: 'Are these prices from the manufacturer websites?',
      answer:
        'Manufacturer sites are linked for company details. Retail bag rates on this page come from Dream Civil’s 2026 India list and HomeRun’s Bengaluru price list (dated 8 May 2026). Plants rarely publish a single all-India dealer rate.',
    },
    {
      question: 'Does the price include GST and delivery?',
      answer:
        'Treat every figure as a published bag reference only. GST, dealer margin, unloading and transport to site are often extra. Compare landed cost, not the headline bag rate.',
    },
    {
      question: 'Why is the Bengaluru shop list different from the national brand list?',
      answer:
        'HomeRun publishes Bengaluru shelf prices for specific products (PPC and OPC 53) as of 8 May 2026. Dream Civil publishes a separate national brand list and city bands. They are different sources, dates and product mixes, so they are shown separately and not blended into one “today” rate.',
    },
  ];

  return {
    retrievedAt: CEMENT_MARKET_RETRIEVED_AT,
    qualification: CEMENT_MARKET_QUALIFICATION,
    manufacturers,
    opc53,
    opc43,
    opc33,
    cities,
    citySummary,
    sources,
    greyBagSpan,
    faqs,
  };
}
