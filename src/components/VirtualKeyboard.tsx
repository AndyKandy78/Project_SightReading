import { useMemo } from 'react'

interface VirtualKeyboardProps {
  activeKeys: Set<number>
  targetKeys: number[]
  octaveMin?: number
  octaveMax?: number
}

// Build key layout for a range of MIDI notes
function buildKeys(minMidi: number, maxMidi: number) {
  const keys: { midi: number; isBlack: boolean; label: string }[] = []
  const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  for (let midi = minMidi; midi <= maxMidi; midi++) {
    const semitone = midi % 12
    const octave = Math.floor(midi / 12) - 1
    const name = noteNames[semitone]
    const isBlack = name.includes('#')
    const label = semitone === 0 ? `C${octave}` : ''
    keys.push({ midi, isBlack, label })
  }
  return keys
}

export function VirtualKeyboard({ activeKeys, targetKeys, octaveMin = 3, octaveMax = 5 }: VirtualKeyboardProps) {
  const minMidi = (octaveMin + 1) * 12   // C of octaveMin
  const maxMidi = (octaveMax + 1) * 12 + 11  // B of octaveMax

  const keys = useMemo(() => buildKeys(minMidi, maxMidi), [minMidi, maxMidi])
  const whiteKeys = keys.filter(k => !k.isBlack)
  const keyWidth = Math.max(20, Math.floor(600 / whiteKeys.length))
  const blackWidth = Math.round(keyWidth * 0.6)
  const whiteHeight = 120
  const blackHeight = 72

  // Map white key index to x position
  const whiteKeyPositions: Map<number, number> = new Map()
  whiteKeys.forEach((k, i) => whiteKeyPositions.set(k.midi, i * keyWidth))

  // For black keys, find position between surrounding white keys
  function blackX(midi: number): number {
    const prevWhite = whiteKeys.filter(w => w.midi < midi).at(-1)
    const nextWhite = whiteKeys.filter(w => w.midi > midi)[0]
    if (!prevWhite || !nextWhite) return 0
    const px = whiteKeyPositions.get(prevWhite.midi) ?? 0
    const nx = whiteKeyPositions.get(nextWhite.midi) ?? 0
    return (px + nx) / 2 + keyWidth / 2 - blackWidth / 2
  }

  const totalWidth = whiteKeys.length * keyWidth

  return (
    <div className="panel overflow-x-auto">
      <p className="label mb-2">Keyboard</p>
      <div style={{ position: 'relative', height: whiteHeight + 4, width: totalWidth, minWidth: 300, margin: '0 auto' }}>
        {/* White keys */}
        {whiteKeys.map(k => {
          const x = whiteKeyPositions.get(k.midi) ?? 0
          const isTarget = targetKeys.includes(k.midi)
          const isActive = activeKeys.has(k.midi)
          let bg = 'bg-gray-100'
          if (isTarget) bg = 'bg-blue-300'
          if (isActive && isTarget) bg = 'bg-green-400'
          else if (isActive) bg = 'bg-yellow-300'
          return (
            <div
              key={k.midi}
              className={`absolute border border-gray-400 rounded-b-md flex items-end justify-center pb-1 select-none transition-colors ${bg}`}
              style={{ left: x, width: keyWidth - 1, height: whiteHeight, top: 0, zIndex: 1 }}
            >
              {k.label && <span className="text-[9px] text-gray-500 font-bold">{k.label}</span>}
            </div>
          )
        })}
        {/* Black keys */}
        {keys.filter(k => k.isBlack).map(k => {
          const x = blackX(k.midi)
          const isTarget = targetKeys.includes(k.midi)
          const isActive = activeKeys.has(k.midi)
          let bg = 'bg-gray-900'
          if (isTarget) bg = 'bg-blue-600'
          if (isActive && isTarget) bg = 'bg-green-600'
          else if (isActive) bg = 'bg-yellow-500'
          return (
            <div
              key={k.midi}
              className={`absolute rounded-b-md select-none transition-colors ${bg}`}
              style={{ left: x, width: blackWidth, height: blackHeight, top: 0, zIndex: 2 }}
            />
          )
        })}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-blue-300"/>&nbsp;Target</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-400"/>&nbsp;Correct</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-yellow-300"/>&nbsp;Playing</span>
      </div>
    </div>
  )
}
