'use client';

import { useTransition } from 'react';
import { addPoint, completeSet, markMatchComplete, resetCurrentSet, undoPoint } from '@/lib/services/actions';

export function ScoringControls({ matchId }: { matchId: string }) {
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      await fn();
      window.location.reload();
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <button disabled={pending} onClick={() => run(() => addPoint(matchId, 'a'))} className="rounded bg-brand-700 px-3 py-4 text-lg font-semibold text-white">+ Team A</button>
      <button disabled={pending} onClick={() => run(() => addPoint(matchId, 'b'))} className="rounded bg-brand-500 px-3 py-4 text-lg font-semibold text-white">+ Team B</button>
      <button disabled={pending} onClick={() => run(() => undoPoint(matchId))} className="rounded border px-3 py-3">Undo</button>
      <button disabled={pending} onClick={() => run(() => completeSet(matchId), 'Complete this set?')} className="rounded border px-3 py-3">Complete Set</button>
      <button disabled={pending} onClick={() => run(() => resetCurrentSet(matchId), 'Reset current set score?')} className="rounded border px-3 py-3">Reset Set</button>
      <button disabled={pending} onClick={() => run(() => markMatchComplete(matchId), 'Mark match complete?')} className="rounded bg-emerald-600 px-3 py-3 text-white">Complete Match</button>
    </div>
  );
}
