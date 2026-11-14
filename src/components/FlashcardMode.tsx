import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { generateNote } from '../lib/noteGenerator'
import type { Note } from '../lib/musicTheory'

/** Flashcard mode: show the note on the staff, let user identify it by name or key */
export function FlashcardMode() {
  const store = useGameStore()
  const [revealed, setRevealed] = useState(false)
  const [currentNote, setCurrentNote] = useState<Note | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')

  const config = {
    keyName: store.keyName,
    minOctave: store.minOctave,
    maxOctave: store.maxOctave,
    clef: store.clef === 'both' ? 'treble' as const : store.clef,
    includeChords: false,
    maxChordSize: 1,
  }

  function next() {
    setRevealed(false)
    setFeedback('idle')
    setInputValue('')
    const note = generateNote(config)
    setCurrentNote(note)
    store.setCurrentNotes([note])
  }

  useEffect(() => {
    if (store.isPlaying && !currentNote) next()
    if (!store.isPlaying) { setCurrentNote(null); setRevealed(false) }
  }, [store.isPlaying])

  // Check MIDI input against flashcard note
  useEffect(() => {
    if (!store.isPlaying || !currentNote || revealed) return
    const pressed = Array.from(store.activeKeys)
    if (pressed.length === 0) return
    const isCorrect = pressed.includes(currentNote.midi)
    if (isCorrect) {
      store.handleNoteCorrect()
      setFeedback('correct')
      setRevealed(true)
      setTimeout(next, 1500)
    } else if (pressed.some(k => k !== currentNote.midi)) {
      store.handleNoteWrong()
      setFeedback('wrong')
      setTimeout(() => setFeedback('idle'), 600)
    }
  }, [store.activeKeys])

  function checkInput() {
    if (!currentNote) return
    const guess = inputValue.trim().toUpperCase().replace('♯','#').replace('♭','b')
    const target = `${currentNote.name}${currentNote.accidental}${currentNote.octave}`
    const targetShort = `${currentNote.name}${currentNote.accidental}`
    if (guess === target || guess === targetShort) {
      store.handleNoteCorrect()
      setFeedback('correct')
      setRevealed(true)
      setTimeout(next, 1500)
    } else {
      store.handleNoteWrong()
      setFeedback('wrong')
      setTimeout(() => { setFeedback('idle'); setInputValue('') }, 600)
    }
  }

  if (!store.isPlaying) return null

  return (
    <div className="panel flex flex-col items-center gap-4 py-6">
      <p className="label">Flashcard Mode — What note is shown on the staff?</p>

      {currentNote && (
        <div className={`text-center transition-all ${feedback === 'correct' ? 'text-green-400' : feedback === 'wrong' ? 'text-red-400' : 'text-gray-200'}`}>
          {revealed ? (
            <div className="text-5xl font-bold tracking-wide">{currentNote.display}</div>
          ) : (
            <div className="text-5xl font-bold tracking-wide">?</div>
          )}
        </div>
      )}

      {!revealed && (
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && checkInput()}
            placeholder="Type note name (e.g. C4, F#)"
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            autoFocus
          />
          <button onClick={checkInput} className="btn btn-primary btn-sm">Check</button>
          <button onClick={() => { setRevealed(true); setFeedback('wrong'); store.handleNoteWrong(); setTimeout(next, 1500) }} className="btn btn-ghost btn-sm">Reveal</button>
        </div>
      )}

      <p className="text-xs text-gray-500">Or play the correct key on your MIDI keyboard</p>
    </div>
  )
}
