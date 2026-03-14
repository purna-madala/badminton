import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('auth_user_id', user.id).single();
  if (profile?.role !== 'admin') redirect('/umpire');

  const [{ count: teams }, { count: players }, { count: ties }, { count: matches }] = await Promise.all([
    supabase.from('teams').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('ties').select('*', { count: 'exact', head: true }),
    supabase.from('tie_matches').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <main className="container-page space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="card"><p className="text-sm">Teams</p><p className="text-2xl font-semibold">{teams ?? 0}</p></div>
        <div className="card"><p className="text-sm">Players</p><p className="text-2xl font-semibold">{players ?? 0}</p></div>
        <div className="card"><p className="text-sm">Ties</p><p className="text-2xl font-semibold">{ties ?? 0}</p></div>
        <div className="card"><p className="text-sm">Matches</p><p className="text-2xl font-semibold">{matches ?? 0}</p></div>
      </div>
      <form action="/api/admin/seed" method="post" className="card max-w-sm">
        <h2 className="font-semibold">Seed Tournament</h2>
        <p className="text-sm text-slate-600">Rebuild teams, players, round-robin ties, and 7 matches per tie.</p>
        <button className="mt-3 rounded bg-brand-700 px-3 py-2 text-white">Run Seed</button>
      </form>
    </main>
  );
}
