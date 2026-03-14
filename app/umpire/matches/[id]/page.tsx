import { redirect } from 'next/navigation';
import { ScoringControls } from '@/components/umpire/scoring-controls';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/status-badge';
import type { MatchSetRow, UmpireMatchDetailRow } from '@/lib/types/view';

export default async function UmpireMatchPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: match } = await supabase
    .from('tie_matches')
    .select(`*,
      tie:ties!tie_matches_tie_id_fkey(id,team_a_id,team_b_id,team_a:teams!ties_team_a_id_fkey(name),team_b:teams!ties_team_b_id_fkey(name)),
      match_sets(*)`)
    .eq('id', params.id)
    .single();

  if (!match) redirect('/umpire');

  const typedMatch = match as UmpireMatchDetailRow;
  const currentSet = typedMatch.match_sets.find((setRow) => setRow.set_number === typedMatch.current_set_number) ?? {
    id: 'current',
    set_number: typedMatch.current_set_number,
    team_a_score: 0,
    team_b_score: 0,
    completed: false,
  };

  return (
    <main className="container-page max-w-2xl space-y-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{typedMatch.category}</h1>
          <StatusBadge status={typedMatch.status} />
        </div>
        <p className="mt-2 text-sm text-slate-600">{typedMatch.tie.team_a.name} vs {typedMatch.tie.team_b.name}</p>
        <p className="mt-2 text-4xl font-bold">{currentSet.team_a_score} - {currentSet.team_b_score}</p>
        <p className="text-sm">Set {typedMatch.current_set_number} · Sets Won {typedMatch.team_a_sets_won}-{typedMatch.team_b_sets_won}</p>
      </div>
      <ScoringControls matchId={typedMatch.id} />
      <div className="card text-sm">
        <h2 className="font-semibold">Set History</h2>
        {[...typedMatch.match_sets].sort((a: MatchSetRow, b: MatchSetRow) => a.set_number - b.set_number).map((set) => (
          <p key={set.id}>Set {set.set_number}: {set.team_a_score} - {set.team_b_score} {set.completed ? '(Done)' : ''}</p>
        ))}
      </div>
    </main>
  );
}
