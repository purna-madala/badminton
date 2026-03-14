import { getStandings } from '@/lib/services/queries';
import type { StandingsRow } from '@/lib/types/view';

export default async function StandingsPage() {
  const standings = (await getStandings()) as StandingsRow[];
  return (
    <main className="container-page">
      <h1 className="mb-4 text-2xl font-bold">Standings</h1>
      <div className="overflow-x-auto card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              {['Team','P','W','L','MW','ML','SW','SL','Pts'].map((head) => (
                <th className="px-3 py-2 text-left" key={head}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => (
              <tr key={row.team_id} className="border-b last:border-0">
                <td className="px-3 py-2 font-medium">{row.team_name}</td>
                <td className="px-3 py-2">{row.ties_played}</td><td className="px-3 py-2">{row.ties_won}</td><td className="px-3 py-2">{row.ties_lost}</td>
                <td className="px-3 py-2">{row.matches_won}</td><td className="px-3 py-2">{row.matches_lost}</td>
                <td className="px-3 py-2">{row.sets_won}</td><td className="px-3 py-2">{row.sets_lost}</td>
                <td className="px-3 py-2 font-semibold">{row.ranking_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
