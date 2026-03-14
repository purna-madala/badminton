export const MATCH_CATEGORIES = [
  'Men\'s Singles',
  'Women\'s Singles',
  'Women\'s Doubles',
  'Men\'s Doubles 1',
  'Men\'s Doubles 2',
  'Mixed Doubles 1',
  'Mixed Doubles 2',
] as const;

export type MatchCategory = (typeof MATCH_CATEGORIES)[number];
