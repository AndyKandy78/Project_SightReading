import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * Initialises WebMidi.js and routes MIDI events to the game store.
 * WebMidi.js v3 uses native ES module exports.
 */
export function useMidi() {
  const store = useGameStore()
  const initialised = useRef(false)

  useEffect(() => {
    if (initialised.current) return
    initialised.current = true

    async function init() {
      try {
        // Dynamic import so it doesn't break SSR / browsers without MIDI
        const { WebMidi } = await import('webmidi')
        await WebMidi.enable({ sysex: false })

        function updateDevice() {
          const inputs = WebMidi.inputs
          if (inputs.length > 0) {
            store.setMidiDevice(inputs[0].name)
            store.setMidiConnected(true)
          } else {
            store.setMidiDevice(null)
            store.setMidiConnected(false)
          }
        }

        updateDevice()

        WebMidi.addListener('connected', updateDevice)
        WebMidi.addListener('disconnected', updateDevice)

        // Route all note-on/off from all inputs
        WebMidi.inputs.forEach(input => attachListeners(input, store))
        WebMidi.addListener('connected', (e: any) => {
          if (e.port.type === 'input') {
            attachListeners(e.port, store)
          }
        })
      } catch (err) {
        console.warn('WebMidi not available:', err)
        store.setMidiConnected(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function attachListeners(input: any, store: ReturnType<typeof useGameStore.getState>) {
  input.addListener('noteon', (e: any) => {
    const midi: number = e.note.number
    store.keyDown(midi)
  })
  input.addListener('noteoff', (e: any) => {
    const midi: number = e.note.number
    store.keyUp(midi)
  })
}
