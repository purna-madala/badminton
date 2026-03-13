'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/status-badge';
import { TeamLogo } from '@/components/shared/team-logo';
import { formatDateTime } from '@/lib/utils/format';

export function TieDetailsLive({ tie }: { tie: any }) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`tie-${tie.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ties', filter: `id=eq.${tie.id}` }, () => window.location.reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tie_matches', filter: `tie_id=eq.${tie.id}` }, () => window.location.reload())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_sets' }, () => window.location.reload())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tie.id]);

  return (
    <>
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TeamLogo src={tie.team_a.logo_url} alt={tie.team_a.name} />
            <span className="font-semibold">{tie.team_a.name}</span>
            <span className="text-2xl font-bold">{tie.team_a_tie_score} - {tie.team_b_tie_score}</span>
            <span className="font-semibold">{tie.team_b.name}</span>
            <TeamLogo src={tie.team_b.logo_url} alt={tie.team_b.name} />
          </div>
          <div className="text-sm text-slate-600">
            <StatusBadge status={tie.status} />
            <p>{formatDateTime(tie.scheduled_at)}</p>
            <p>{tie.court_label ?? tie.venue ?? 'Venue TBD'}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {tie.tie_matches.sort((a: any, b: any) => a.order_index - b.order_index).map((match: any) => (
          <div key={match.id} className="card">
            <div className="flex items-center justify-between"><h2 className="font-semibold">{match.category}</h2><StatusBadge status={match.status} /></div>
            <p className="text-sm text-slate-600">Sets: {match.team_a_sets_won} - {match.team_b_sets_won}</p>
            {[1,2,3].map((setNumber) => {
              const set = match.match_sets.find((s: any) => s.set_number === setNumber);
              return <p className="text-sm" key={setNumber}>Set {setNumber}: {set?.team_a_score ?? 0} - {set?.team_b_score ?? 0}</p>;
            })}
          </div>
        ))}
      </div>
    </>
  );
}
