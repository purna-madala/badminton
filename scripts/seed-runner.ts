import { MATCH_CATEGORIES } from '@/lib/constants/categories';
import { seedConfig } from './seed-data';

export async function runSeed(supabase: any) {
  await supabase.from('score_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('match_sets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tie_matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('ties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data: teams } = await supabase.from('teams').insert(seedConfig.teams).select('*');

  for (const team of teams) {
    const players = seedConfig.playersByTeam[team.name as keyof typeof seedConfig.playersByTeam] ?? [];
    await supabase.from('players').insert(players.map((full_name) => ({ team_id: team.id, full_name })));
  }

  const scheduledBase = new Date();
  const tiePairs: Array<[number, number]> = [
    [0,1],[0,2],[0,3],[1,2],[1,3],[2,3],
  ];

  for (let i = 0; i < tiePairs.length; i += 1) {
    const [aIdx, bIdx] = tiePairs[i];
    const teamA = teams[aIdx];
    const teamB = teams[bIdx];
    const scheduledAt = new Date(scheduledBase.getTime() + i * 60 * 60 * 1000).toISOString();

    const { data: tie } = await supabase.from('ties').insert({
      team_a_id: teamA.id,
      team_b_id: teamB.id,
      scheduled_at: scheduledAt,
      status: 'upcoming',
      venue: 'Main Hall',
      court_label: `Court ${1 + (i % 3)}`,
    }).select('*').single();

    const [{ data: teamAPlayers }, { data: teamBPlayers }] = await Promise.all([
      supabase.from('players').select('id').eq('team_id', teamA.id),
      supabase.from('players').select('id').eq('team_id', teamB.id),
    ]);

    for (let order = 0; order < MATCH_CATEGORIES.length; order += 1) {
      await supabase.from('tie_matches').insert({
        tie_id: tie.id,
        category: MATCH_CATEGORIES[order],
        order_index: order + 1,
        team_a_player_1_id: teamAPlayers?.[0]?.id ?? null,
        team_a_player_2_id: teamAPlayers?.[1]?.id ?? null,
        team_b_player_1_id: teamBPlayers?.[0]?.id ?? null,
        team_b_player_2_id: teamBPlayers?.[1]?.id ?? null,
      });
    }
  }
}
