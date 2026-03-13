export type TieStatus = 'upcoming' | 'live' | 'finished' | 'paused';
export type MatchStatus = 'not_started' | 'live' | 'finished' | 'paused';

export interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface Tie {
  id: string;
  team_a_id: string;
  team_b_id: string;
  scheduled_at: string | null;
  status: TieStatus;
  venue: string | null;
  court_label: string | null;
  team_a_tie_score: number;
  team_b_tie_score: number;
  winner_team_id: string | null;
  updated_at: string;
}

export interface TieMatch {
  id: string;
  tie_id: string;
  category: string;
  order_index: number;
  team_a_player_1_id: string | null;
  team_a_player_2_id: string | null;
  team_b_player_1_id: string | null;
  team_b_player_2_id: string | null;
  current_set_number: number;
  team_a_sets_won: number;
  team_b_sets_won: number;
  status: MatchStatus;
  winner_team_id: string | null;
  umpire_user_id: string | null;
  updated_at: string;
}
