import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { runSeed } from './seed-runner';

async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  await runSeed(supabase);
  console.log('Seed completed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
