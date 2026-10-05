import { redirect } from 'next/navigation';

type Params = { params: Promise<{ id: string }> };

export default async function HrRentalRedirect({ params }: Params) {
  const { id } = await params;
  redirect(`/crm/proposals/${id}/rental`);
}
