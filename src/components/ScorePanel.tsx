import type { SessionStats } from '../store/gameStore'

interface ScorePanelProps {
  stats: SessionStats
}

export function ScorePanel({ stats }: ScorePanelProps) {
  const accuracy = stats.totalNotes > 0 ? Math.round((stats.correct / stats.totalNotes) * 100) : 0

  return (
    <div className="panel flex flex-col gap-3">
      <p className="label">Session Stats</p>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Accuracy" value={`${accuracy}%`} color={accuracy >= 80 ? 'text-green-400' : accuracy >= 60 ? 'text-yellow-400' : 'text-red-400'} />
        <Stat label="Streak 🔥" value={String(stats.streak)} color="text-orange-400" />
        <Stat label="Best Streak" value={String(stats.bestStreak)} color="text-purple-400" />
        <Stat label="Total Notes" value={String(stats.totalNotes)} color="text-blue-400" />
        <Stat label="Correct ✓" value={String(stats.correct)} color="text-green-400" />
        <Stat label="Wrong ✗" value={String(stats.wrong)} color="text-red-400" />
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-gray-700 rounded-lg p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}
