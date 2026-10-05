import { redirect } from 'next/navigation';

export default function HrNewProposalRedirect() {
  redirect('/crm/proposals/new');
}
