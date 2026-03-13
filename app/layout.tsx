import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Badminton Team Tournament',
  description: 'Live scoring and tournament management for badminton team events.',
};

const navItems = [
  { href: '/live', label: 'Live Scores' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/results', label: 'Results' },
  { href: '/standings', label: 'Standings' },
  { href: '/umpire', label: 'Umpire' },
  { href: '/admin', label: 'Admin' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-slate-200 bg-white">
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
            <Link href="/" className="text-lg font-semibold text-brand-900">
              Badminton Team Tournament
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-md px-3 py-1 hover:bg-slate-100">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
