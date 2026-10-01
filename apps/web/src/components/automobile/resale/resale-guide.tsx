import Link from 'next/link';

export const RESALE_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: 'How is car resale value calculated?',
    answer:
      'Varnarc starts from the variant’s catalogue price, or an approximate new price if the catalogue has none. It then applies a fallback depreciation curve for the car’s age, segment and fuel type, and adjusts for kilometres, owners, condition, service history, accident history and location when you provide them.',
  },
  {
    question: 'How accurate is the Varnarc car resale value calculator?',
    answer:
      'It is an indicative planning estimate. It is not a guaranteed dealer, exchange or private-sale price. Accuracy improves when the exact variant, kilometres, city, condition, service history and accident history are filled in. A physical inspection can still change the price.',
  },
  {
    question: 'How much value does a car lose every year?',
    answer:
      'New cars usually lose value faster in the first years, then more slowly. Varnarc’s fallback curve is roughly in the mid-teens in year one and a smaller share of the remaining value in later years. Those rates are assumptions, not a promise of what your car will sell for.',
  },
  {
    question: 'Does mileage affect resale value?',
    answer:
      'Yes. The calculator compares kilometres driven with a typical annual distance for that fuel type in India. Lower-than-typical use can raise the estimate slightly. High and very high use reduces it. Highway and city kilometres can wear a car differently even at the same odometer reading.',
  },
  {
    question: 'Does accident history reduce car value?',
    answer:
      'A reported minor repair has a small effect. A major repaired accident, structural or chassis damage, or flood damage reduces the estimate more. The final price still depends on how well the repair was done.',
  },
  {
    question: 'Does service history improve resale value?',
    answer:
      'A complete authorised or otherwise complete service record supports a higher estimate than missing records. Regular servicing is evidence that maintenance was kept up. It does not by itself guarantee a higher sale price.',
  },
  {
    question: 'Do automatic cars have better resale value?',
    answer:
      'The fallback model applies a small, configurable adjustment for automatic transmissions because demand differs by city and segment. It is not a claim that every automatic is worth more than every manual.',
  },
  {
    question: 'How does ownership count affect resale value?',
    answer:
      'A first-owner car is the baseline. Second, third and later owners receive progressively larger deductions, with a cap so ownership alone cannot collapse the estimate.',
  },
  {
    question: 'Does city or location affect used-car prices?',
    answer:
      'Local demand, supply and registration costs can change prices. Until Varnarc has a verified adjustment for a city, the location factor is zero rather than an invented premium or discount.',
  },
  {
    question: 'How is EV resale value calculated?',
    answer:
      'Electric cars use their own depreciation and expected-kilometre assumptions. If you know battery health, remaining battery warranty or whether the battery was replaced, those optional details can refine the estimate. They are not required.',
  },
  {
    question: 'When should I check my car’s resale value?',
    answer:
      'Check it when you are planning a sale, an exchange, insurance cover or the cost of keeping the car. Repeat the estimate if the kilometres, condition or city change. The figure is a snapshot, not a standing offer.',
  },
];

export function ResaleValueGuide() {
  return (
    <div className="mt-12 w-full space-y-10 text-sm leading-relaxed text-slate-700">
      <section id="how-valuation-works" className="scroll-mt-24">
        <h2 className="text-xl font-extrabold text-[#0b1f3a]">
          How Varnarc estimates your car&apos;s resale value
        </h2>
        <p className="mt-3">
          The estimate uses the new-car price on file, the vehicle&apos;s age, kilometres, number of
          owners, fuel type, transmission, condition, service history, accident history, location
          and model characteristics such as body type. When a published variant has an ex-showroom
          price, that figure is the starting point. If it does not, you can enter an approximate
          price when the car was new.
        </p>
        <p className="mt-3">
          Where Varnarc does not yet hold verified used-car transactions for that variant, a
          configurable fallback depreciation curve is used. Segment, fuel and any admin overrides
          change that curve, so a hatchback, a luxury sedan and an electric SUV are not treated as
          the same car. The result is an estimate for planning. It is not a quotation from a dealer
          or a private buyer.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-[#0b1f3a]">
          How car depreciation works in India
        </h2>
        <p className="mt-3">
          Depreciation is the drop from the price of a new car to what a used example is likely to
          fetch. The largest fall is usually early, when the car leaves the showroom and the first
          owner absorbs the initial loss. Later years still reduce value, but each year tends to
          take a smaller share of what is left.
        </p>
        <p className="mt-3">
          Age matters because more years usually mean more wear, an older design and a shorter
          remaining useful life. Kilometres matter because they are a practical measure of use.
          Condition matters because two cars of the same age can look and drive very differently.
          Fuel type and transmission change running costs and buyer preference. Model demand and
          brand reputation change how quickly a listing finds a buyer. A discontinued model can be
          harder to sell if buyers worry about parts, even when the car itself is sound.
        </p>
        <p className="mt-3">
          Used-car prices also move with supply in a city. None of these factors is a fixed national
          rate. The calculator keeps them as settings so they can be replaced when better market
          evidence is available.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-[#0b1f3a]">
          How kilometres driven affect resale value
        </h2>
        <p className="mt-3">
          Low mileage, compared with a typical year of driving for that fuel, can support a slightly
          higher estimate because the car has had less use. Average mileage is treated as the
          baseline. High mileage reduces the estimate. Very high mileage reduces it further, up to a
          cap so the odometer cannot by itself produce an unrealistic figure.
        </p>
        <p className="mt-3">
          The same kilometre total is not identical wear. Highway kilometres are often steadier than
          short city trips with more clutch, brake and cold-engine use. The calculator cannot see
          that mix, so the adjustment is based on the reading you enter.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-[#0b1f3a]">
          Does the number of owners affect car value?
        </h2>
        <p className="mt-3">
          Buyers often prefer a first-owner car because the history is simpler and the car has
          usually had one pattern of use. A second owner can still be a straightforward purchase,
          but the estimate applies a moderate deduction. Third and later owners see a larger
          deduction. The size of that deduction is capped. Ownership count is not proof of neglect,
          and a well-kept multi-owner car can still sell well after inspection.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-[#0b1f3a]">Why service history matters</h2>
        <p className="mt-3">
          Authorised service history shows that scheduled work was done in a brand network, which
          some buyers prefer. A complete set of bills from any workshop still shows that servicing
          happened. Partial records are treated as neutral. Missing records make it harder to
          confirm oil changes, timing work and major repairs, so the estimate is lower. Major
          repairs are not automatically bad if they are documented and done properly.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-[#0b1f3a]">
          How fuel type affects resale value
        </h2>
        <p className="mt-3">
          Petrol cars are the baseline in the fallback model. Diesel, CNG, hybrid and electric cars
          use separate assumptions because buyer demand, running cost and regulation have not moved
          in lockstep. CNG can appeal where fuel cost matters and can be less popular where boot
          space or availability matters. Electric resale depends heavily on battery condition and
          remaining warranty, which is why those fields are optional rather than guessed. These
          differences are settings, not a claim that one fuel will always hold value better.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-[#0b1f3a]">Common questions</h2>
        <dl className="mt-4 space-y-4">
          {RESALE_FAQS.map((item) => (
            <div key={item.question}>
              <dt className="font-semibold text-[#0b1f3a]">{item.question}</dt>
              <dd className="mt-1">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="text-xs leading-relaxed text-slate-500">
        Varnarc&apos;s resale-value estimate is for informational purposes and is based on the
        vehicle details provided and available pricing/depreciation assumptions. Actual dealer,
        marketplace, exchange or private-sale prices may vary based on inspection, local demand,
        documentation and market conditions.
      </p>
      <p className="text-xs text-slate-500">
        Explore{' '}
        <Link href="/automobile/manufacturers" className="font-semibold text-[#ea580c]">
          manufacturers
        </Link>
        ,{' '}
        <Link href="/automobile/compare" className="font-semibold text-[#ea580c]">
          comparisons
        </Link>{' '}
        and{' '}
        <Link href="/automobile/guides" className="font-semibold text-[#ea580c]">
          automobile guides
        </Link>
        .
      </p>
    </div>
  );
}
