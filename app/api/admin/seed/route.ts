import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { runSeed } from '@/scripts/seed-runner';

export async function POST() {
  await runSeed(supabaseAdmin);
  return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
