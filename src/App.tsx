import { useMidi } from './hooks/useMidi'
import { useGameLoop } from './hooks/useGameLoop'
import { useGameStore } from './store/gameStore'
import { Staff } from './components/Staff'
import { VirtualKeyboard } from './components/VirtualKeyboard'
import { ScorePanel } from './components/ScorePanel'
import { SettingsPanel } from './components/SettingsPanel'
import { MidiStatus } from './components/MidiStatus'
import { FlashcardMode } from './components/FlashcardMode'

export default function App() {
  useMidi()
  useGameLoop()

  const store = useGameStore()

  const targetMidi = store.currentNotes.map(n => n.midi)
  const noteStatusClass =
    store.noteStatus === 'correct' ? 'ring-2 ring-green-500' :
    store.noteStatus === 'wrong' ? 'ring-2 ring-red-500' : ''

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎹</span>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">SightRead Pro</h1>
            <p className="text-xs text-gray-500">Piano Sight Reading Trainer</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MidiStatus connected={store.midiConnected} deviceName={store.midiDeviceName} />
          {store.isPlaying ? (
            <button onClick={store.stopSession} className="btn btn-ghost">⏹ Stop</button>
          ) : (
            <button onClick={store.startSession} className="btn btn-success">▶ Start Practice</button>
          )}
          {store.isPlaying && (
            <button onClick={store.resetStats} className="btn btn-ghost btn-sm">Reset Stats</button>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Left sidebar: settings */}
        <aside className="w-72 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto flex-shrink-0">
          <SettingsPanel />
        </aside>

        {/* Center: staff + keyboard */}
        <main className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          {/* Status banner */}
          {store.isPlaying && store.currentNotes.length > 0 && store.mode !== 'flashcard' && (
            <div className={`panel flex items-center justify-between transition-all ${noteStatusClass}`}>
              <div>
                <span className="label">Play this note</span>
                <div className="text-3xl font-bold mt-1 tracking-wide">
                  {store.currentNotes.map(n => n.display).join(' + ')}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {store.mode === 'rhythm' && (
                  <div className="text-center">
                    <span className="label block">BPM</span>
                    <span className="text-2xl font-bold text-blue-400">{store.bpm}</span>
                  </div>
                )}
                <div className="text-4xl">
                  {store.noteStatus === 'correct' ? '✅' : store.noteStatus === 'wrong' ? '❌' : '👀'}
                </div>
              </div>
            </div>
          )}

          {!store.isPlaying && (
            <div className="panel text-center py-10">
              <div className="text-5xl mb-4">🎹</div>
              <h2 className="text-xl font-bold text-white mb-2">Ready to Practice?</h2>
              <p className="text-gray-400 mb-4">Configure your settings on the left, then hit <strong>Start Practice</strong>.</p>
              <p className="text-sm text-gray-500">Plug in your Casio keyboard via USB — it will be detected automatically.</p>
            </div>
          )}

          {/* Staff */}
          <div className={`transition-all ${noteStatusClass} rounded-xl`}>
            <Staff
              currentNotes={store.currentNotes}
              nextNotes={store.nextNotes}
              keyName={store.keyName}
              clef={store.clef}
              noteStatus={store.noteStatus}
            />
          </div>

          {/* Flashcard mode overlay */}
          {store.mode === 'flashcard' && <FlashcardMode />}

          {/* Virtual Keyboard */}
          <VirtualKeyboard
            activeKeys={store.activeKeys}
            targetKeys={targetMidi}
            octaveMin={store.minOctave}
            octaveMax={store.maxOctave}
          />
        </main>

        {/* Right sidebar: score */}
        <aside className="w-56 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto flex-shrink-0">
          <ScorePanel stats={store.stats} />

          {/* Next note hint */}
          {store.isPlaying && store.nextNotes.length > 0 && store.mode !== 'flashcard' && (
            <div className="panel mt-4">
              <p className="label mb-1">Coming up</p>
              <p className="text-lg font-semibold text-gray-300">
                {store.nextNotes.map(n => n.display).join(' + ')}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 px-6 py-2 text-center text-xs text-gray-600">
        SightRead Pro - Web MIDI API - VexFlow - WebMidi.js
        {!store.midiConnected && (
          <span className="ml-3 text-yellow-600">For MIDI, open in Chrome/Edge and allow MIDI access</span>
        )}
      </footer>
    </div>
  )
}
