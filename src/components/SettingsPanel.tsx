import { useGameStore } from '../store/gameStore'
import { KEY_SIGNATURES } from '../lib/musicTheory'

export function SettingsPanel() {
  const store = useGameStore()

  const keyNames = Object.keys(KEY_SIGNATURES)

  return (
    <div className="panel flex flex-col gap-4">
      <p className="label">Settings</p>

      {/* Practice Mode */}
      <div>
        <label className="label block mb-1">Practice Mode</label>
        <div className="flex gap-2 flex-wrap">
          {(['note-by-note', 'rhythm', 'flashcard'] as const).map(m => (
            <button
              key={m}
              onClick={() => store.setMode(m)}
              disabled={store.isPlaying}
              className={`btn btn-sm capitalize ${store.mode === m ? 'btn-primary' : 'btn-ghost'}`}
            >
              {m === 'note-by-note' ? '🎯 Note-by-note' : m === 'rhythm' ? '🥁 Rhythm' : '🃏 Flashcard'}
            </button>
          ))}
        </div>
      </div>

      {/* Clef */}
      <div>
        <label className="label block mb-1">Clef</label>
        <div className="flex gap-2">
          {(['treble', 'bass', 'both'] as const).map(c => (
            <button
              key={c}
              onClick={() => store.setClef(c)}
              disabled={store.isPlaying}
              className={`btn btn-sm capitalize ${store.clef === c ? 'btn-primary' : 'btn-ghost'}`}
            >
              {c === 'treble' ? '𝄞 Treble' : c === 'bass' ? '𝄢 Bass' : '🎼 Both'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Signature */}
      <div>
        <label className="label block mb-1">Key Signature</label>
        <select
          value={store.keyName}
          onChange={e => store.setKey(e.target.value)}
          disabled={store.isPlaying}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {keyNames.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {/* Octave Range */}
      <div>
        <label className="label block mb-1">
          Octave Range: {store.minOctave} – {store.maxOctave}
        </label>
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Min</label>
            <input type="range" min={1} max={6} value={store.minOctave}
              onChange={e => store.setOctaveRange(Number(e.target.value), Math.max(Number(e.target.value), store.maxOctave))}
              disabled={store.isPlaying}
              className="w-full accent-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500">Max</label>
            <input type="range" min={1} max={7} value={store.maxOctave}
              onChange={e => store.setOctaveRange(Math.min(store.minOctave, Number(e.target.value)), Number(e.target.value))}
              disabled={store.isPlaying}
              className="w-full accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* BPM (rhythm mode) */}
      {store.mode === 'rhythm' && (
        <div>
          <label className="label block mb-1">BPM: {store.bpm}</label>
          <input type="range" min={30} max={200} step={5} value={store.bpm}
            onChange={e => store.setBpm(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>30</span><span>Slow ← → Fast</span><span>200</span>
          </div>
        </div>
      )}

      {/* Chords */}
      <div className="flex items-center justify-between">
        <label className="label">Include Chords</label>
        <button
          onClick={() => store.setIncludeChords(!store.includeChords)}
          disabled={store.isPlaying}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${store.includeChords ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${store.includeChords ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  )
}
