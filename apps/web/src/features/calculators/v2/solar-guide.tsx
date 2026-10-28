export const SOLAR_PAGE_FAQ = [
  {
    q: 'How much can I save with a 3 kW solar system?',
    a: 'It depends on your tariff, how much generation you use at home, and the export credit. The comparison table uses your bill and does not add a subsidy unless a published eligible scheme applies.',
  },
  {
    q: 'How many solar panels do I need for a ₹3,000 electricity bill?',
    a: 'Enter ₹3,000 and use Suggest. The tool recommends kilowatts. The panel count depends on the module wattage your installer supplies.',
  },
  {
    q: 'What is the payback period for rooftop solar?',
    a: 'Payback is the first year cumulative net cash flow is no longer negative. If that never happens in the model, the result says it was not reached within 25 years.',
  },
  {
    q: 'How does government subsidy affect installation cost?',
    a: 'It reduces net upfront cost only when eligibility is on and an amount is set. The illustrative default applies none.',
  },
  {
    q: 'Is a 5 kW solar system suitable for my home?',
    a: 'Compare the 5 kW row with your annual consumption. Extra generation is only valuable if the export rate pays for it.',
  },
  {
    q: 'Can solar reduce my electricity bill to zero?',
    a: 'Night use, fixed charges, and export rules usually leave a residual bill. The comparison chart shows that estimate.',
  },
  {
    q: 'How does net metering work?',
    a: 'Eligible connections can export surplus units for a credit set by the state regulator. That credit is not assumed to equal the retail tariff.',
  },
  {
    q: 'What happens during cloudy weather?',
    a: 'Output drops. The annual yield is an average, so one cloudy week is not modelled on its own.',
  },
  {
    q: 'How long do solar panels last?',
    a: 'The cash flow runs 25 years with yearly degradation. The default also sets aside an inverter replacement in year 12.',
  },
  {
    q: 'How accurate are solar savings estimates?',
    a: 'They are planning estimates. Shade, tariff orders, and workmanship move the result. Published records replace illustrative defaults after an administrator verifies them.',
  },
];

const SECTIONS = [
  {
    title: 'How does a solar savings calculator work?',
    body: 'It turns a system size and a location yield into annual generation, splits that generation into electricity you use and electricity you export, and values only the self-used units at your energy charge. Export is valued at a separate compensation rate. Maintenance, degradation, tariff changes, and an optional inverter replacement then build a 25-year cash flow.',
  },
  {
    title: 'How much electricity can a 1 kW solar system generate?',
    body: 'A planning figure used here is about 1,500 kWh per kW per year, roughly 4 kWh per kW on an average day. That is an illustration until a published location record replaces it. A shaded or east-west roof will land lower.',
  },
  {
    title: 'How to calculate solar savings in India',
    body: 'Select the state and city, enter the monthly bill or the kWh you use, and set the system size. Annual consumption is monthly kWh times 12. Annual generation is kilowatts times the yield. First-year savings are self-consumed units times the tariff, plus exported units times the export rate, minus maintenance.',
  },
  {
    title: 'Rooftop solar installation costs',
    body: 'Gross cost is system size times a cost per kW. The default cost per kW is a planning assumption, not a quotation. Enter a written installer price in Advanced mode when you have one.',
  },
  {
    title: 'Government rooftop solar subsidies',
    body: 'Central and state schemes change. This calculator applies a subsidy only when eligibility is switched on or a published scheme record matches the system size. Confirm the current benefit on the official scheme site. The amount is not filled in from memory.',
  },
  {
    title: 'Solar panel payback period',
    body: 'Payback is the first point where cumulative net cash flow is no longer negative. The model does not divide net cost by a single savings figure, because savings change every year. If the cumulative total stays negative, the result is “Not reached within 25 years.”',
  },
  {
    title: 'Net metering explained',
    body: 'Surplus daytime units can be exported when the connection is eligible. The credit is set by the state commission and is often lower than the rate you pay to import a unit at night. Quick mode therefore values exports at ₹0 until you enter the rate from your tariff order.',
  },
  {
    title: 'How rooftop shading affects savings',
    body: 'Shade on part of a string can cut output well below the annual yield used here. The calculator cannot see your roof. Treat the generation number as an unshaded planning case.',
  },
  {
    title: 'Solar panel maintenance and lifespan',
    body: 'The default model uses 0.7% degradation per year, a maintenance allowance per kilowatt, and an inverter replacement in year 12 equal to 12% of the gross installation cost. Each of those is an assumption you can replace in Advanced mode or with a published defaults record.',
  },
  {
    title: 'How to choose the right solar capacity',
    body: 'Match annual generation to the units you can use on site, unless you know the export credit. The comparison table recalculates 1 kW through 10 kW with the same location assumptions. Use a size, then calculate again.',
  },
];

export function SolarGuide() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0b1f3a] dark:text-white">
          How to use this calculator
        </h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
          <li>Select your state and city.</li>
          <li>Enter your monthly electricity bill or consumption.</li>
          <li>Choose or adjust the suggested solar system size.</li>
          <li>Review installation cost and subsidy assumptions.</li>
          <li>Click Calculate Savings.</li>
          <li>Compare monthly savings, lifetime benefit, and payback.</li>
        </ol>
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#0b1f3a] dark:text-white">About this calculator</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          It estimates rooftop solar generation, the part of that generation that offsets your own
          consumption, installation cost after an eligible subsidy, and the year cumulative net cash
          flow recovers that cost. Actual savings move with shade, season, the DISCOM tariff,
          net-metering rules, and how the system is installed.
        </p>
      </div>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <h2 className="text-xl font-bold text-[#0b1f3a] dark:text-white">{section.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {section.body}
          </p>
        </div>
      ))}
      <div>
        <h2 className="text-xl font-bold text-[#0b1f3a] dark:text-white">Worked example</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          A 3 kW system at 1,500 kWh per kW generates 4,500 kWh in year one. At 70%
          self-consumption, 3,150 kWh offsets imports. At an illustrative ₹8 per kWh and ₹0 export
          credit, gross electricity savings are ₹25,200 before maintenance of ₹2,400. That
          arithmetic is a demonstration. It is not a Karnataka tariff order and it includes no
          subsidy.
        </p>
      </div>
    </section>
  );
}
