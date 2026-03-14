import Link from 'next/link';

const cards = [
  { href: '/live', title: 'Live Scores', description: 'Watch real-time updates from each court.' },
  { href: '/schedule', title: 'Schedule', description: 'See upcoming ties and match timings.' },
  { href: '/results', title: 'Results', description: 'Review completed ties and match outcomes.' },
  { href: '/standings', title: 'Standings', description: 'Track team ranking and progress.' },
];

export function NavCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <Link key={card.href} href={card.href} className="card hover:border-brand-500 hover:shadow-md">
          <h2 className="font-semibold text-brand-900">{card.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{card.description}</p>
        </Link>
      ))}
    </div>
  );
}
