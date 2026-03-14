import { NavCards } from '@/components/public/nav-cards';
import { LiveTies } from '@/components/public/live-ties';
import { getLiveTies } from '@/lib/services/queries';
import type { TieListRow } from '@/lib/types/view';

async function HomePage() {
  const ties = (await getLiveTies()) as TieListRow[];

  return (
    <main className="container-page space-y-6">
      <section className="card bg-gradient-to-r from-brand-900 to-brand-700 text-white">
        <h1 className="text-2xl font-bold">Team Tournament Scoreboard</h1>
        <p className="mt-1 text-sm text-slate-100">Follow every tie, match, and set in real time.</p>
      </section>
      <NavCards />
      <section>
        <h2 className="mb-3 text-xl font-semibold">Currently Live</h2>
        <LiveTies initialTies={ties} />
      </section>
    </main>
  );
}

export default HomePage;
