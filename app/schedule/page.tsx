import Link from 'next/link';
import { TeamLogo } from '@/components/shared/team-logo';
import { StatusBadge } from '@/components/shared/status-badge';
import { getAllTies } from '@/lib/services/queries';
import { formatDateTime } from '@/lib/utils/format';
import type { TieListRow } from '@/lib/types/view';

export default async function SchedulePage() {
  const ties = (await getAllTies()) as TieListRow[];
  return (
    <main className="container-page">
      <h1 className="mb-4 text-2xl font-bold">Schedule / Fixtures</h1>
      <div className="space-y-3">
        {ties.map((tie) => (
          <div key={tie.id} className="card flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TeamLogo src={tie.team_a.logo_url} alt={tie.team_a.name} />
              <span>{tie.team_a.name}</span>
              <span className="text-slate-400">vs</span>
              <span>{tie.team_b.name}</span>
              <TeamLogo src={tie.team_b.logo_url} alt={tie.team_b.name} />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span>{formatDateTime(tie.scheduled_at)}</span>
              <StatusBadge status={tie.status} />
              <Link href={`/ties/${tie.id}`} className="text-brand-700 underline">Details</Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
