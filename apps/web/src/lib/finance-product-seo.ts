/** Fallback meta/body copy when CMS seoDescription/description is empty. */

export function financeProductDescription(input: {
  name: string;
  kind: 'loan' | 'credit-card';
  bankName?: string | null;
  seoDescription?: string | null;
  description?: string | null;
  shortDescription?: string | null;
}): string {
  const fromCms =
    input.seoDescription?.trim() || input.description?.trim() || input.shortDescription?.trim();
  if (fromCms) return fromCms;

  const bank = input.bankName?.trim();
  const label = bank ? `${bank} ${input.name}` : input.name;
  if (input.kind === 'credit-card') {
    return `${label} — fees, rewards, and key features on Varnarc. Confirm terms with the issuer before you apply.`;
  }
  return `${label} — indicative rates, tenure, and eligibility on Varnarc. Verify the latest terms with the lender.`;
}

export function articleListingDescription(title: string, excerpt?: string | null): string {
  const trimmed = excerpt?.trim();
  if (trimmed && !/^Learn how to use the /i.test(trimmed)) {
    return trimmed;
  }
  return `${title} — inputs that matter, how to read the results, and what to verify with a lender or advisor.`;
}
