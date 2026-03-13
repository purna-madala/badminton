import { redirect } from 'next/navigation';
import { ScoringControls } from '@/components/umpire/scoring-controls';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/status-badge';

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

  const currentSet = match.match_sets.find((s: any) => s.set_number === match.current_set_number) ?? { team_a_score: 0, team_b_score: 0 };

  return (
    <main className="container-page max-w-2xl space-y-4">
      <div className="card">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{match.category}</h1>
          <StatusBadge status={match.status} />
        </div>
        <p className="mt-2 text-sm text-slate-600">{match.tie.team_a.name} vs {match.tie.team_b.name}</p>
        <p className="mt-2 text-4xl font-bold">{currentSet.team_a_score} - {currentSet.team_b_score}</p>
        <p className="text-sm">Set {match.current_set_number} · Sets Won {match.team_a_sets_won}-{match.team_b_sets_won}</p>
      </div>
      <ScoringControls matchId={match.id} />
      <div className="card text-sm">
        <h2 className="font-semibold">Set History</h2>
        {match.match_sets.sort((a: any, b: any) => a.set_number - b.set_number).map((set: any) => (
          <p key={set.id}>Set {set.set_number}: {set.team_a_score} - {set.team_b_score} {set.completed ? '(Done)' : ''}</p>
        ))}
      </div>
    </main>
  );
}
