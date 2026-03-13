export function formatDateTime(input: string | null) {
  if (!input) return 'TBD';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(input));
}

export function statusBadgeColor(status: string) {
  if (status === 'live') return 'bg-red-100 text-red-700';
  if (status === 'finished') return 'bg-emerald-100 text-emerald-700';
  if (status === 'paused') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}
