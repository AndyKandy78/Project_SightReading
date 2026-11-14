import { create } from 'zustand'
import type { Note, PracticeMode } from '../lib/musicTheory'

export interface SessionStats {
  correct: number
  wrong: number
  streak: number
  bestStreak: number
  totalNotes: number
}

export interface GameState {
  // Settings
  mode: PracticeMode
  keyName: string
  minOctave: number
  maxOctave: number
  bpm: number
  clef: 'treble' | 'bass' | 'both'
  includeChords: boolean

  // Runtime
  isPlaying: boolean
  currentNotes: Note[]       // what to play now
  nextNotes: Note[]          // upcoming (for rhythm mode preview)
  lastPlayedMidi: number[]   // recently played MIDI notes
  noteStatus: 'idle' | 'correct' | 'wrong'  // feedback status
  stats: SessionStats

  // MIDI
  midiDeviceName: string | null
  midiConnected: boolean
  activeKeys: Set<number>    // currently held MIDI keys

  // Actions
  setMode: (m: PracticeMode) => void
  setKey: (k: string) => void
  setOctaveRange: (min: number, max: number) => void
  setBpm: (b: number) => void
  setClef: (c: 'treble' | 'bass' | 'both') => void
  setIncludeChords: (v: boolean) => void
  startSession: () => void
  stopSession: () => void
  setCurrentNotes: (notes: Note[]) => void
  setNextNotes: (notes: Note[]) => void
  handleNoteCorrect: () => void
  handleNoteWrong: () => void
  setNoteStatus: (s: 'idle' | 'correct' | 'wrong') => void
  setMidiDevice: (name: string | null) => void
  setMidiConnected: (v: boolean) => void
  keyDown: (midi: number) => void
  keyUp: (midi: number) => void
  resetStats: () => void
}

const defaultStats: SessionStats = {
  correct: 0, wrong: 0, streak: 0, bestStreak: 0, totalNotes: 0
}

export const useGameStore = create<GameState>((set) => ({
  mode: 'note-by-note',
  keyName: 'C major',
  minOctave: 3,
  maxOctave: 6,
  bpm: 60,
  clef: 'both',
  includeChords: false,
  isPlaying: false,
  currentNotes: [],
  nextNotes: [],
  lastPlayedMidi: [],
  noteStatus: 'idle',
  stats: { ...defaultStats },
  midiDeviceName: null,
  midiConnected: false,
  activeKeys: new Set(),

  setMode: (m) => set({ mode: m }),
  setKey: (k) => set({ keyName: k }),
  setOctaveRange: (min, max) => set({ minOctave: min, maxOctave: max }),
  setBpm: (b) => set({ bpm: b }),
  setClef: (c) => set({ clef: c }),
  setIncludeChords: (v) => set({ includeChords: v }),
  startSession: () => set({ isPlaying: true, stats: { ...defaultStats }, noteStatus: 'idle' }),
  stopSession: () => set({ isPlaying: false, noteStatus: 'idle', currentNotes: [], nextNotes: [] }),
  setCurrentNotes: (notes) => set({ currentNotes: notes }),
  setNextNotes: (notes) => set({ nextNotes: notes }),
  handleNoteCorrect: () => set(s => {
    const streak = s.stats.streak + 1
    return {
      noteStatus: 'correct',
      stats: {
        ...s.stats,
        correct: s.stats.correct + 1,
        streak,
        bestStreak: Math.max(s.stats.bestStreak, streak),
        totalNotes: s.stats.totalNotes + 1,
      }
    }
  }),
  handleNoteWrong: () => set(s => ({
    noteStatus: 'wrong',
    stats: { ...s.stats, wrong: s.stats.wrong + 1, streak: 0, totalNotes: s.stats.totalNotes + 1 }
  })),
  setNoteStatus: (s) => set({ noteStatus: s }),
  setMidiDevice: (name) => set({ midiDeviceName: name }),
  setMidiConnected: (v) => set({ midiConnected: v }),
  keyDown: (midi) => set(s => {
    const activeKeys = new Set(s.activeKeys)
    activeKeys.add(midi)
    return { activeKeys, lastPlayedMidi: [...s.lastPlayedMidi.slice(-9), midi] }
  }),
  keyUp: (midi) => set(s => {
    const activeKeys = new Set(s.activeKeys)
    activeKeys.delete(midi)
    return { activeKeys }
  }),
  resetStats: () => set({ stats: { ...defaultStats } }),
}))
