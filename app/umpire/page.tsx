import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/shared/status-badge';
import { signOut } from '@/lib/services/actions';
import type { UmpireMatchListRow } from '@/lib/types/view';

export default async function UmpireDashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('user_profiles').select('*').eq('auth_user_id', user.id).single();

  const query = supabase
    .from('tie_matches')
    .select('*, tie:ties!tie_matches_tie_id_fkey(id,team_a:teams!ties_team_a_id_fkey(name),team_b:teams!ties_team_b_id_fkey(name),status)')
    .in('status', ['not_started', 'live', 'paused'])
    .order('updated_at', { ascending: false });

  const { data: matches } = profile?.role === 'umpire'
    ? await query.eq('umpire_user_id', user.id)
    : await query;

  const typedMatches = (matches ?? []) as UmpireMatchListRow[];

  return (
    <main className="container-page space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Umpire Dashboard</h1>
        <form action={signOut}><button className="rounded border px-3 py-1">Sign out</button></form>
      </div>
      <div className="grid gap-3">
        {typedMatches.map((match) => (
          <div className="card" key={match.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{match.tie.team_a.name} vs {match.tie.team_b.name}</p>
                <p className="text-sm text-slate-600">{match.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={match.status} />
                <Link href={`/umpire/matches/${match.id}`} className="text-brand-700 underline">Score</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
