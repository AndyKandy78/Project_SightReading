import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * Initialises WebMidi.js and routes MIDI events to the game store.
 * Supports auto-detection on connect/disconnect and manual rescan.
 */
export function useMidi() {
  const store = useGameStore()
  const rescanTrigger = useGameStore(s => s.rescanTrigger)
  const isEnabledRef = useRef(false)
  const webMidiRef = useRef<any>(null)

  const attachListeners = useCallback((input: any) => {
    try {
      input.removeListener('noteon')
      input.removeListener('noteoff')

      input.addListener('noteon', (e: any) => {
        const midi: number = e.note.number
        useGameStore.getState().keyDown(midi)
      })

      input.addListener('noteoff', (e: any) => {
        const midi: number = e.note.number
        useGameStore.getState().keyUp(midi)
      })
    } catch (e) {
      console.warn('Failed to attach MIDI listeners to input:', input?.name, e)
    }
  }, [])

  const updateDeviceList = useCallback((WebMidi: any) => {
    const inputs = WebMidi.inputs || []
    if (inputs.length > 0) {
      const activeInput = inputs[0]
      store.setMidiDevice(activeInput.name || 'MIDI Keyboard')
      store.setMidiConnected(true)
      store.setMidiError(null)
      inputs.forEach((input: any) => attachListeners(input))
    } else {
      store.setMidiDevice(null)
      store.setMidiConnected(false)
    }
  }, [attachListeners, store])

  const enableMidi = useCallback(async () => {
    if (typeof window === 'undefined') return

    // 1. Check browser support
    if (!('requestMIDIAccess' in navigator)) {
      store.setMidiError('Web MIDI is not supported in this browser. Please open this app in Google Chrome or Microsoft Edge.')
      store.setMidiConnected(false)
      return
    }

    try {
      const { WebMidi } = await import('webmidi')
      webMidiRef.current = WebMidi

      if (!WebMidi.enabled) {
        await WebMidi.enable({ sysex: false })
      }

      isEnabledRef.current = true
      store.setMidiError(null)

      // Listen for hotplug events
      WebMidi.removeListener('connected')
      WebMidi.removeListener('disconnected')

      WebMidi.addListener('connected', (e: any) => {
        if (e.port?.type === 'input') {
          attachListeners(e.port)
        }
        updateDeviceList(WebMidi)
      })

      WebMidi.addListener('disconnected', () => {
        updateDeviceList(WebMidi)
      })

      updateDeviceList(WebMidi)
    } catch (err: any) {
      console.warn('WebMidi enable failed:', err)
      const message = err?.message || String(err)
      if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('denied')) {
        store.setMidiError('MIDI permission denied. Please allow MIDI in your browser site permissions.')
      } else {
        store.setMidiError(`MIDI initialization error: ${message}`)
      }
      store.setMidiConnected(false)
    }
  }, [attachListeners, store, updateDeviceList])

  // Initial load
  useEffect(() => {
    enableMidi()
  }, [enableMidi])

  // Manual rescan trigger
  useEffect(() => {
    if (rescanTrigger > 0) {
      if (webMidiRef.current && webMidiRef.current.enabled) {
        updateDeviceList(webMidiRef.current)
      } else {
        enableMidi()
      }
    }
  }, [rescanTrigger, enableMidi, updateDeviceList])
}
