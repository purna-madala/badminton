import Link from 'next/link';
import { signInWithPassword } from '@/lib/services/actions';

export default function LoginPage() {
  return (
    <main className="container-page max-w-md">
      <div className="card space-y-4">
        <h1 className="text-xl font-semibold">Umpire/Admin Login</h1>
        <form action={signInWithPassword} className="space-y-3">
          <input name="email" type="email" required placeholder="Email" className="w-full rounded border px-3 py-2" />
          <input name="password" type="password" required placeholder="Password" className="w-full rounded border px-3 py-2" />
          <button type="submit" className="w-full rounded bg-brand-700 px-3 py-2 text-white">Sign in</button>
        </form>
        <p className="text-sm text-slate-500">Back to <Link href="/" className="underline">Home</Link></p>
      </div>
    </main>
  );
}
