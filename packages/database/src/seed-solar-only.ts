import { PrismaClient } from '@prisma/client';
import { seedSolarReferences } from './seed-solar-references';

const prisma = new PrismaClient();

const faq = [
  {
    q: 'How much can I save with a 3 kW solar system?',
    a: 'It depends on your tariff, how much of the generation you use at home, and the export credit your DISCOM actually pays. Use the comparison table on this page with your state and bill. The result is an estimate, and no subsidy is included unless a published eligible scheme applies.',
  },
  {
    q: 'How many solar panels do I need for a ₹3,000 electricity bill?',
    a: 'Enter ₹3,000 as the monthly bill. The calculator suggests a system size from an illustrative tariff and yield, which you can edit. Panel count depends on the wattage of the modules your installer uses, so this tool reports kilowatts rather than a panel count.',
  },
  {
    q: 'What is the payback period for rooftop solar?',
    a: 'Payback is the first year when cumulative net cash flow becomes zero or positive, after maintenance and any modelled inverter replacement. If that does not happen inside the modelled life, the result says it was not reached.',
  },
  {
    q: 'How does government subsidy affect installation cost?',
    a: 'A subsidy reduces net upfront cost only when you mark the system as eligible and an amount is set from a published scheme. Illustrative defaults apply ₹0. Check the current notification on the official scheme website before you rely on a benefit.',
  },
  {
    q: 'Is a 5 kW solar system suitable for my home?',
    a: 'Compare the 5 kW row with your annual consumption. A system that generates far more than you can use on site depends on export compensation, which this calculator does not treat as the full retail tariff.',
  },
  {
    q: 'Can solar reduce my electricity bill to zero?',
    a: 'Often no. Night-time use, fixed charges, seasonal generation, and export rules leave a residual bill. The bill comparison shows an estimate of what can remain.',
  },
  {
    q: 'How does net metering work?',
    a: 'Net metering lets an eligible connection export surplus solar units and receive a credit defined by the state regulator. The credit is frequently below the retail energy charge. Set the export compensation rate in Advanced mode to match the order that applies to you.',
  },
  {
    q: 'What happens during cloudy weather?',
    a: 'Generation falls. The annual yield is an average, not a sunny-day figure, so a single cloudy week is not modelled hour by hour.',
  },
  {
    q: 'How long do solar panels last?',
    a: 'The model runs for 25 years and reduces output each year by the degradation rate. Inverters are often replaced earlier. The default replacement year is an assumption you can inspect in the methodology.',
  },
  {
    q: 'How accurate are solar savings estimates?',
    a: 'They are planning estimates. Roof direction, shade, soiling, workmanship, and the tariff order can move the result. Published location, tariff, and price records replace the illustrative defaults when an administrator verifies them.',
  },
];

async function main() {
  const updated = await prisma.calculator.update({
    where: { slug: 'solar' },
    data: {
      name: 'Solar Savings Calculator India',
      description:
        'Calculate how much you could save with rooftop solar panels in India. Estimate installation costs, monthly electricity savings, eligible government subsidies, and payback period using your location and electricity consumption.',
      seoTitle: 'Solar Savings Calculator India 2026 — Cost, Subsidy & Payback | Varnarc',
      seoDescription:
        'Estimate rooftop solar savings in India. Calculate solar installation cost, monthly electricity savings, eligible subsidies, annual generation, and payback period.',
      settings: { pageVersion: 'v2', faq },
      status: 'PUBLISHED',
      deletedAt: null,
    },
    select: { slug: true, name: true, seoTitle: true },
  });
  await seedSolarReferences(prisma);
  const refs = await prisma.solarReference.count();
  console.log(JSON.stringify({ calculator: updated, solarReferences: refs }));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
