import { type Note, getScaleNotes } from './musicTheory'

export type GeneratorConfig = {
  keyName: string
  minOctave: number
  maxOctave: number
  clef: 'treble' | 'bass' | 'both'
  includeChords: boolean
  maxChordSize: number
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateNote(config: GeneratorConfig): Note {
  let minOct = config.minOctave
  let maxOct = config.maxOctave

  if (config.clef === 'treble') {
    minOct = Math.max(minOct, 4)
    maxOct = Math.max(maxOct, 5)
  } else if (config.clef === 'bass') {
    maxOct = Math.min(maxOct, 4)
    minOct = Math.min(minOct, 3)
  }

  const pool = getScaleNotes(config.keyName, minOct, maxOct)
  if (pool.length === 0) return getScaleNotes('C major', 4, 5)[0]
  return randomItem(pool)
}

export function generateChord(config: GeneratorConfig, size = 2): Note[] {
  const pool = getScaleNotes(config.keyName, config.minOctave, config.maxOctave)
  if (pool.length < size) return [generateNote(config)]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, size).sort((a, b) => a.midi - b.midi)
}

export function generateSequence(config: GeneratorConfig, length: number): Note[][] {
  const seq: Note[][] = []
  for (let i = 0; i < length; i++) {
    if (config.includeChords && Math.random() < 0.3) {
      const size = 2 + Math.floor(Math.random() * (config.maxChordSize - 1))
      seq.push(generateChord(config, size))
    } else {
      seq.push([generateNote(config)])
    }
  }
  return seq
}
