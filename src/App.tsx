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
      <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎹</span>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">SightRead Pro</h1>
            <p className="text-xs text-gray-500">Piano Sight Reading Trainer</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <MidiStatus
            connected={store.midiConnected}
            deviceName={store.midiDeviceName}
            error={store.midiError}
            onRescan={store.triggerRescan}
          />
          {store.isPlaying ? (
            <button onClick={store.stopSession} className="btn btn-ghost text-sm">⏹ Stop</button>
          ) : (
            <button onClick={store.startSession} className="btn btn-success text-sm">▶ Start</button>
          )}
          {store.isPlaying && (
            <button onClick={store.resetStats} className="btn btn-ghost btn-sm text-xs">Reset</button>
          )}
        </div>
      </header>

      {/* Optional Error Alert */}
      {store.midiError && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 md:px-6 py-2 text-xs flex items-center justify-between">
          <span>⚠️ {store.midiError}</span>
          <button
            onClick={store.triggerRescan}
            className="underline hover:text-white font-medium ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main layout: responsive for mobile & desktop */}
      <div className="flex flex-col lg:flex-row flex-1 gap-0 overflow-y-auto lg:overflow-hidden">
        {/* Center: staff + keyboard (shown first on mobile) */}
        <main className="flex-1 flex flex-col p-3 md:p-4 gap-4 overflow-y-auto order-1 lg:order-2">
          {/* Status banner */}
          {store.isPlaying && store.currentNotes.length > 0 && store.mode !== 'flashcard' && (
            <div className={`panel flex items-center justify-between transition-all ${noteStatusClass}`}>
              <div>
                <span className="label">Play this note</span>
                <div className="text-2xl md:text-3xl font-bold mt-1 tracking-wide">
                  {store.currentNotes.map(n => n.display).join(' + ')}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {store.mode === 'rhythm' && (
                  <div className="text-center">
                    <span className="label block">BPM</span>
                    <span className="text-xl md:text-2xl font-bold text-blue-400">{store.bpm}</span>
                  </div>
                )}
                <div className="text-3xl md:text-4xl">
                  {store.noteStatus === 'correct' ? '✅' : store.noteStatus === 'wrong' ? '❌' : '👀'}
                </div>
              </div>
            </div>
          )}

          {!store.isPlaying && (
            <div className="panel text-center py-6 md:py-10">
              <div className="text-4xl md:text-5xl mb-3 md:mb-4">🎹</div>
              <h2 className="text-lg md:text-xl font-bold text-white mb-2">Ready to Practice?</h2>
              <p className="text-gray-400 mb-3 text-sm md:text-base">
                Configure your settings below, then tap <strong>Start Practice</strong>.
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                Connect your Casio keyboard via USB (or USB OTG on phone) and power it ON.
              </p>
            </div>
          )}

          {/* Staff */}
          <div className={`transition-all ${noteStatusClass} rounded-xl overflow-x-auto`}>
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
          <div className="overflow-x-auto pb-2">
            <VirtualKeyboard
              activeKeys={store.activeKeys}
              targetKeys={targetMidi}
              octaveMin={store.minOctave}
              octaveMax={store.maxOctave}
            />
          </div>
        </main>

        {/* Left sidebar: settings (underneath on mobile, left sidebar on desktop) */}
        <aside className="w-full lg:w-72 bg-gray-900 border-t lg:border-t-0 lg:border-r border-gray-800 p-4 overflow-y-auto flex-shrink-0 order-2 lg:order-1">
          <SettingsPanel />
        </aside>

        {/* Right sidebar: score */}
        <aside className="w-full lg:w-56 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-800 p-4 overflow-y-auto flex-shrink-0 order-3">
          <ScorePanel stats={store.stats} />

          {/* Next note hint */}
          {store.isPlaying && store.nextNotes.length > 0 && store.mode !== 'flashcard' && (
            <div className="panel mt-4">
              <p className="label mb-1">Coming up</p>
              <p className="text-base md:text-lg font-semibold text-gray-300">
                {store.nextNotes.map(n => n.display).join(' + ')}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 md:px-6 py-2 text-center text-xs text-gray-600">
        SightRead Pro - Web MIDI API - VexFlow - WebMidi.js
        {!store.midiConnected && (
          <span className="block sm:inline sm:ml-3 text-yellow-600">
            For MIDI, ensure keyboard is powered ON and use Chrome or Edge
          </span>
        )}
      </footer>
    </div>
  )
}
