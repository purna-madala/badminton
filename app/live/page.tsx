import { LiveTies } from '@/components/public/live-ties';
import { getLiveTies } from '@/lib/services/queries';
import type { TieListRow } from '@/lib/types/view';

export default async function LivePage() {
  const ties = (await getLiveTies()) as TieListRow[];

export default async function LivePage() {
  const ties = await getLiveTies();

  return (
    <main className="container-page">
      <h1 className="mb-4 text-2xl font-bold">Live Scores</h1>
      <LiveTies initialTies={ties} />
    </main>
  );
}
