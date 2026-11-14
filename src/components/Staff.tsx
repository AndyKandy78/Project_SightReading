import { useEffect, useRef } from 'react'
import Vex from 'vexflow'
import { type Note, KEY_SIGNATURES } from '../lib/musicTheory'

interface StaffProps {
  currentNotes: Note[]
  nextNotes: Note[]
  keyName: string
  clef: 'treble' | 'bass' | 'both'
  noteStatus: 'idle' | 'correct' | 'wrong'
}

export function Staff({ currentNotes, nextNotes, keyName, clef, noteStatus }: StaffProps) {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!divRef.current) return
    const el = divRef.current
    el.innerHTML = ''

    const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = Vex.Flow

    const width = el.clientWidth || 700
    const renderer = new Renderer(el, Renderer.Backends.SVG)
    renderer.resize(width, clef === 'both' ? 240 : 150)
    const context = renderer.getContext()
    context.setFont('Arial', 10)

    const keySig = KEY_SIGNATURES[keyName]
    const vexKeySig = keySig?.vexKeySpec ?? 'C'

    const statusColor = noteStatus === 'correct' ? '#22c55e' : noteStatus === 'wrong' ? '#ef4444' : '#3b82f6'

    function makeStaveNote(clefStr: 'treble' | 'bass', notes: Note[], color: string) {
      if (notes.length === 0) return null
      const keys = notes.map(n => n.vexKey)
      const sn = new StaveNote({ clef: clefStr, keys, duration: 'q' })
      notes.forEach((n, i) => {
        if (n.accidental) sn.addModifier(new Accidental(n.accidental), i)
      })
      sn.setStyle({ fillStyle: color, strokeStyle: color })
      return sn
    }

    const renderSingleClef = (clefStr: 'treble' | 'bass', yOffset: number, notes: Note[], nextN: Note[]) => {
      const stave = new Stave(10, yOffset, width - 20)
      stave.addClef(clefStr).addKeySignature(vexKeySig).addTimeSignature('4/4')
      stave.setContext(context).draw()

      const noteObjs: any[] = []

      const curr = makeStaveNote(clefStr, notes, statusColor)
      if (curr) noteObjs.push(curr)
      else {
        const rest = new StaveNote({ clef: clefStr, keys: [clefStr === 'treble' ? 'b/4' : 'd/3'], duration: 'qr' })
        noteObjs.push(rest)
      }

      const next = makeStaveNote(clefStr, nextN, '#6b7280')
      if (next) noteObjs.push(next)

      // Pad with rests to fill measure
      while (noteObjs.length < 4) {
        const rest = new StaveNote({ clef: clefStr, keys: [clefStr === 'treble' ? 'b/4' : 'd/3'], duration: 'qr' })
        noteObjs.push(rest)
      }

      const voice = new Voice({ num_beats: 4, beat_value: 4 }).setStrict(false)
      voice.addTickables(noteObjs)
      new Formatter().joinVoices([voice]).format([voice], width - 80)
      voice.draw(context, stave)
    }

    if (clef === 'both') {
      renderSingleClef('treble', 10, currentNotes.filter(n => n.octave >= 4), nextNotes.filter(n => n.octave >= 4))
      renderSingleClef('bass', 120, currentNotes.filter(n => n.octave < 4), nextNotes.filter(n => n.octave < 4))
    } else {
      renderSingleClef(clef, 10, currentNotes, nextNotes)
    }
  }, [currentNotes, nextNotes, keyName, clef, noteStatus])

  return (
    <div className="panel flex-1 min-h-[180px]">
      <div ref={divRef} className="w-full staff-container" style={{ filter: 'invert(1) hue-rotate(180deg)' }} />
    </div>
  )
}
