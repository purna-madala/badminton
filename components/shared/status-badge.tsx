import { statusBadgeColor } from '@/lib/utils/format';

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${statusBadgeColor(status)}`}>{status.replace('_', ' ')}</span>;
}
