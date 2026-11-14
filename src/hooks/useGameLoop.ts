import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'
import { generateNote, type GeneratorConfig } from '../lib/noteGenerator'
import { notesMatch } from '../lib/musicTheory'

/**
 * Core game loop hook — drives note-by-note, rhythm, and flashcard modes.
 */
export function useGameLoop() {
  const store = useGameStore()
  const rhythmTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevActiveKeys = useRef<Set<number>>(new Set())
  const awaitingRelease = useRef(false)  // prevent double-advance on hold

  const config: GeneratorConfig = {
    keyName: store.keyName,
    minOctave: store.minOctave,
    maxOctave: store.maxOctave,
    clef: store.clef,
    includeChords: store.includeChords,
    maxChordSize: 3,
  }

  const advanceNote = useCallback(() => {
    const note = generateNote({ ...config, clef: store.clef === 'both' ? 'treble' : store.clef })
    const nextNote = generateNote({ ...config, clef: store.clef === 'both' ? 'treble' : store.clef })
    store.setCurrentNotes([note])
    store.setNextNotes([nextNote])
    store.setNoteStatus('idle')
    awaitingRelease.current = false
  }, [store, config])

  // Advance when session starts
  useEffect(() => {
    if (store.isPlaying && store.currentNotes.length === 0) {
      advanceNote()
    }
    if (!store.isPlaying) {
      if (rhythmTimer.current) clearInterval(rhythmTimer.current)
    }
  }, [store.isPlaying])

  // Rhythm mode: auto-advance at BPM
  useEffect(() => {
    if (store.mode !== 'rhythm' || !store.isPlaying) {
      if (rhythmTimer.current) clearInterval(rhythmTimer.current)
      return
    }
    const ms = (60 / store.bpm) * 1000
    rhythmTimer.current = setInterval(() => {
      advanceNote()
    }, ms)
    return () => { if (rhythmTimer.current) clearInterval(rhythmTimer.current) }
  }, [store.mode, store.isPlaying, store.bpm, advanceNote])

  // Note-by-note mode: watch active keys for matches
  useEffect(() => {
    if (store.mode !== 'note-by-note' || !store.isPlaying || store.currentNotes.length === 0) return

    const currentlyDown = store.activeKeys
    const prevDown = prevActiveKeys.current

    // Find newly pressed keys
    const newlyPressed: number[] = []
    currentlyDown.forEach(midi => {
      if (!prevDown.has(midi)) newlyPressed.push(midi)
    })
    prevActiveKeys.current = new Set(currentlyDown)

    if (newlyPressed.length === 0 || awaitingRelease.current) return

    const target = store.currentNotes[0]
    const isCorrect = newlyPressed.some(midi => notesMatch(midi, target))

    if (isCorrect) {
      store.handleNoteCorrect()
      awaitingRelease.current = true
      // Play audio feedback
      playBeep(880, 80, 'sine')
      // Brief delay then advance
      feedbackTimer.current = setTimeout(() => {
        advanceNote()
      }, 300)
    } else {
      store.handleNoteWrong()
      playBeep(220, 150, 'sawtooth')
      feedbackTimer.current = setTimeout(() => {
        store.setNoteStatus('idle')
      }, 400)
    }
  }, [store.activeKeys])

  // Flashcard mode: pressing any key reveals the answer
  // (handled inside FlashcardMode component)
}

/** Simple Web Audio API beep */
function playBeep(freq: number, durationMs: number, type: OscillatorType) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000)
    osc.start()
    osc.stop(ctx.currentTime + durationMs / 1000)
  } catch {}
}
