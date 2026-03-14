import { getTieDetail } from '@/lib/services/queries';
import { TieDetailsLive } from '@/components/public/tie-details-live';
import type { TieListRow } from '@/lib/types/view';

export default async function TieDetailsPage({ params }: { params: { id: string } }) {
  const tie = (await getTieDetail(params.id)) as TieListRow;

  return (
    <main className="container-page space-y-4">
      <TieDetailsLive tie={tie} />
    </main>
  );
}
