export interface SetScore {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
  completed: boolean;
}

export interface MatchRule {
  setsToWin: number;
  maxSets: number;
}

export const BEST_OF_THREE_RULE: MatchRule = {
  setsToWin: 2,
  maxSets: 3,
};

export function calculateSetsWon(sets: SetScore[]) {
  return sets.reduce(
    (acc, set) => {
      if (!set.completed) return acc;
      if (set.teamAScore > set.teamBScore) acc.teamA += 1;
      if (set.teamBScore > set.teamAScore) acc.teamB += 1;
      return acc;
    },
    { teamA: 0, teamB: 0 },
  );
}

export function resolveWinner(sets: SetScore[], rule: MatchRule = BEST_OF_THREE_RULE): 'team_a' | 'team_b' | null {
  const { teamA, teamB } = calculateSetsWon(sets);
  if (teamA >= rule.setsToWin) return 'team_a';
  if (teamB >= rule.setsToWin) return 'team_b';
  return null;
}
