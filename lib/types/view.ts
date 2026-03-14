export interface TeamBrief {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface MatchSetRow {
  id: string;
  set_number: number;
  team_a_score: number;
  team_b_score: number;
  completed: boolean;
}

export interface TieMatchRow {
  id: string;
  category: string;
  order_index: number;
  current_set_number: number;
  team_a_sets_won: number;
  team_b_sets_won: number;
  status: string;
  match_sets: MatchSetRow[];
}

export interface TieListRow {
  id: string;
  scheduled_at: string | null;
  status: string;
  court_label: string | null;
  updated_at: string;
  team_a_tie_score: number;
  team_b_tie_score: number;
  team_a: TeamBrief;
  team_b: TeamBrief;
  tie_matches: TieMatchRow[];
}

export interface StandingsRow {
  team_id: string;
  team_name: string;
  ties_played: number;
  ties_won: number;
  ties_lost: number;
  matches_won: number;
  matches_lost: number;
  sets_won: number;
  sets_lost: number;
  ranking_points: number;
}

export interface UmpireMatchListRow {
  id: string;
  category: string;
  status: string;
  tie: {
    team_a: { name: string };
    team_b: { name: string };
  };
}

export interface UmpireMatchDetailRow {
  id: string;
  category: string;
  status: string;
  current_set_number: number;
  team_a_sets_won: number;
  team_b_sets_won: number;
  match_sets: MatchSetRow[];
  tie: {
    team_a: { name: string };
    team_b: { name: string };
  };
}
