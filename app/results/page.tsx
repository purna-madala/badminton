import Link from 'next/link';
import { TeamLogo } from '@/components/shared/team-logo';
import { getAllTies } from '@/lib/services/queries';
import type { TieListRow } from '@/lib/types/view';

export default async function ResultsPage() {
  const ties = ((await getAllTies()) as TieListRow[]).filter((tie) => tie.status === 'finished');

  return (
    <main className="container-page">
      <h1 className="mb-4 text-2xl font-bold">Results</h1>
      <div className="space-y-3">
        {ties.map((tie) => (
          <div key={tie.id} className="card">
            <div className="flex items-center gap-2">
              <TeamLogo src={tie.team_a.logo_url} alt={tie.team_a.name} />
              <span>{tie.team_a.name}</span>
              <strong>{tie.team_a_tie_score} - {tie.team_b_tie_score}</strong>
              <span>{tie.team_b.name}</span>
              <TeamLogo src={tie.team_b.logo_url} alt={tie.team_b.name} />
            </div>
            <Link href={`/ties/${tie.id}`} className="mt-2 inline-block text-sm text-brand-700 underline">View tie details</Link>
          </div>
        ))}
      </div>
    </main>
  );
}
