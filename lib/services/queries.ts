import { createClient as createServerClient } from '@/lib/supabase/server';

export async function getLiveTies() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('ties')
    .select(
      `
      *,
      team_a:teams!ties_team_a_id_fkey(id, name, logo_url),
      team_b:teams!ties_team_b_id_fkey(id, name, logo_url),
      tie_matches(
        *,
        team_a_player_1:players!tie_matches_team_a_player_1_id_fkey(full_name),
        team_a_player_2:players!tie_matches_team_a_player_2_id_fkey(full_name),
        team_b_player_1:players!tie_matches_team_b_player_1_id_fkey(full_name),
        team_b_player_2:players!tie_matches_team_b_player_2_id_fkey(full_name),
        match_sets(*)
      )
    `,
    )
    .in('status', ['live', 'paused'])
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAllTies() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('ties')
    .select('*, team_a:teams!ties_team_a_id_fkey(id,name,logo_url), team_b:teams!ties_team_b_id_fkey(id,name,logo_url)')
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getTieDetail(id: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('ties')
    .select(
      `
      *,
      team_a:teams!ties_team_a_id_fkey(id, name, logo_url),
      team_b:teams!ties_team_b_id_fkey(id, name, logo_url),
      tie_matches(
        *,
        team_a_player_1:players!tie_matches_team_a_player_1_id_fkey(full_name),
        team_a_player_2:players!tie_matches_team_a_player_2_id_fkey(full_name),
        team_b_player_1:players!tie_matches_team_b_player_1_id_fkey(full_name),
        team_b_player_2:players!tie_matches_team_b_player_2_id_fkey(full_name),
        match_sets(*)
      )
    `,
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getStandings() {
  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('get_standings');
  if (error) throw error;
  return data;
}
