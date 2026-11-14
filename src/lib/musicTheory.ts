// Music theory constants and helpers

export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type Accidental = '' | '#' | 'b'
export type Clef = 'treble' | 'bass'
export type PracticeMode = 'note-by-note' | 'rhythm' | 'flashcard'

export interface Note {
  name: NoteName
  accidental: Accidental
  octave: number
  /** MIDI note number 0-127 */
  midi: number
  /** VexFlow key string e.g. "c/4" */
  vexKey: string
  /** Display string e.g. "C4" */
  display: string
}

export interface KeySignature {
  name: string
  sharps: NoteName[]
  flats: NoteName[]
  /** Notes in scale */
  scale: NoteName[]
  vexKeySpec: string
}

// --- Key Signatures ---
export const KEY_SIGNATURES: Record<string, KeySignature> = {
  'C major':  { name: 'C major',  sharps: [],                                   flats: [],                                   scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'C' },
  'G major':  { name: 'G major',  sharps: ['F'],                                 flats: [],                                   scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'G' },
  'D major':  { name: 'D major',  sharps: ['F','C'],                             flats: [],                                   scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'D' },
  'A major':  { name: 'A major',  sharps: ['F','C','G'],                         flats: [],                                   scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'A' },
  'E major':  { name: 'E major',  sharps: ['F','C','G','D'],                     flats: [],                                   scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'E' },
  'B major':  { name: 'B major',  sharps: ['F','C','G','D','A'],                 flats: [],                                   scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'B' },
  'F major':  { name: 'F major',  sharps: [],                                   flats: ['B'],                                 scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'F' },
  'Bb major': { name: 'Bb major', sharps: [],                                   flats: ['B','E'],                             scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'Bb' },
  'Eb major': { name: 'Eb major', sharps: [],                                   flats: ['B','E','A'],                         scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'Eb' },
  'Ab major': { name: 'Ab major', sharps: [],                                   flats: ['B','E','A','D'],                     scale: ['C','D','E','F','G','A','B'], vexKeySpec: 'Ab' },
}

// MIDI note number to Note object
export function midiToNote(midi: number): Note {
  const noteNames: NoteName[] = ['C','C','D','D','E','F','F','G','G','A','A','B']
  const accidentals: Accidental[] = ['', '#', '', '#', '', '', '#', '', '#', '', '#', '']
  const semitone = midi % 12
  const octave = Math.floor(midi / 12) - 1
  const name = noteNames[semitone]
  const accidental = accidentals[semitone]
  const display = `${name}${accidental}${octave}`
  const vexKey = `${name.toLowerCase()}${accidental}/${octave}`
  return { name, accidental, octave, midi, vexKey, display }
}

export function noteToMidi(name: NoteName, accidental: Accidental, octave: number): number {
  const semitones: Record<NoteName, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const accidentalOffset: Record<Accidental, number> = { '': 0, '#': 1, 'b': -1 }
  return (octave + 1) * 12 + semitones[name] + accidentalOffset[accidental]
}

/** Get all notes in a given key signature and octave range */
export function getScaleNotes(
  keyName: string,
  minOctave: number,
  maxOctave: number,
): Note[] {
  const key = KEY_SIGNATURES[keyName]
  if (!key) return []
  const notes: Note[] = []
  for (let oct = minOctave; oct <= maxOctave; oct++) {
    for (const noteName of key.scale) {
      const acc: Accidental = key.sharps.includes(noteName) ? '#' : key.flats.includes(noteName) ? 'b' : ''
      const midi = noteToMidi(noteName, acc, oct)
      notes.push(midiToNote(midi))
    }
  }
  return notes.filter(n => n.midi >= 21 && n.midi <= 108) // 88 key range
}

/** Check if a played MIDI note matches the target note */
export function notesMatch(played: number, target: Note): boolean {
  return played === target.midi
}
