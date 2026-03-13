'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function signInWithPassword(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  revalidatePath('/umpire');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/');
}

export async function addPoint(matchId: string, side: 'a' | 'b') {
  const supabase = createClient();
  const { error } = await supabase.rpc('add_match_point', { p_match_id: matchId, p_team_side: side });
  if (error) throw new Error(error.message);
  revalidatePath('/umpire');
}

export async function undoPoint(matchId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('undo_last_point', { p_match_id: matchId });
  if (error) throw new Error(error.message);
  revalidatePath('/umpire');
}

export async function completeSet(matchId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('complete_current_set', { p_match_id: matchId });
  if (error) throw new Error(error.message);
  revalidatePath('/umpire');
}

export async function resetCurrentSet(matchId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('reset_current_set', { p_match_id: matchId });
  if (error) throw new Error(error.message);
  revalidatePath('/umpire');
}

export async function markMatchComplete(matchId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc('finalize_match_manually', { p_match_id: matchId });
  if (error) throw new Error(error.message);
  revalidatePath('/umpire');
}
