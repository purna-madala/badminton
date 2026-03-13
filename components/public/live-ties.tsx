'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TeamLogo } from '@/components/shared/team-logo';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDateTime } from '@/lib/utils/format';

export function LiveTies({ initialTies }: { initialTies: any[] }) {
  const [ties, setTies] = useState(initialTies);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('public-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ties' }, () => {
        window.location.reload();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tie_matches' }, () => {
        window.location.reload();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_sets' }, () => {
        window.location.reload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => setTies(initialTies), [initialTies]);

  if (!ties.length) return <div className="card">No live ties right now.</div>;

  return (
    <div className="space-y-4">
      {ties.map((tie) => (
        <div className="card" key={tie.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TeamLogo src={tie.team_a.logo_url} alt={tie.team_a.name} />
              <span className="font-semibold">{tie.team_a.name}</span>
              <span className="text-xl font-bold">{tie.team_a_tie_score}</span>
              <span className="text-slate-500">vs</span>
              <span className="text-xl font-bold">{tie.team_b_tie_score}</span>
              <span className="font-semibold">{tie.team_b.name}</span>
              <TeamLogo src={tie.team_b.logo_url} alt={tie.team_b.name} />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <StatusBadge status={tie.status} />
              <span>{tie.court_label ?? 'Court TBD'}</span>
              <span className="text-slate-500">Updated {formatDateTime(tie.updated_at)}</span>
              <Link className="text-brand-700 underline" href={`/ties/${tie.id}`}>
                Details
              </Link>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {tie.tie_matches.map((match: any) => {
              const currentSet = match.match_sets.find((set: any) => set.set_number === match.current_set_number) ?? match.match_sets[0];
              return (
                <div key={match.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{match.category}</p>
                    <StatusBadge status={match.status} />
                  </div>
                  <p className="mt-1 text-slate-600">{match.team_a_sets_won} - {match.team_b_sets_won} sets</p>
                  <p className="text-slate-700">Live set: {currentSet?.team_a_score ?? 0} - {currentSet?.team_b_score ?? 0}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
