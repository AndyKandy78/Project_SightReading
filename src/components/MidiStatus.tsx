import { useState } from 'react'

interface MidiStatusProps {
  connected: boolean
  deviceName: string | null
  error?: string | null
  onRescan?: () => void
}

export function MidiStatus({ connected, deviceName, error, onRescan }: MidiStatusProps) {
  const [isScanning, setIsScanning] = useState(false)

  const handleRescan = () => {
    if (onRescan) {
      setIsScanning(true)
      onRescan()
      setTimeout(() => setIsScanning(false), 800)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          connected
            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
            : error
            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
            : 'bg-gray-800/80 text-gray-400 border border-gray-700/60'
        }`}
        title={error ?? (connected ? `Connected to ${deviceName}` : 'Plug in Casio keyboard via USB and click Rescan')}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            connected
              ? 'bg-emerald-400 animate-pulse'
              : error
              ? 'bg-rose-400'
              : 'bg-amber-400'
          }`}
        />
        <span className="truncate max-w-[180px]">
          {connected ? (deviceName ?? 'MIDI Device') : error ? 'MIDI Error' : 'No MIDI Device'}
        </span>
      </div>

      {!connected && (
        <button
          type="button"
          onClick={handleRescan}
          disabled={isScanning}
          className="text-xs px-2.5 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition flex items-center gap-1 active:scale-95"
          title="Click to scan for connected MIDI keyboard"
        >
          <span className={`inline-block ${isScanning ? 'animate-spin' : ''}`}>↻</span>
          <span>{isScanning ? 'Scanning...' : 'Rescan'}</span>
        </button>
      )}
    </div>
  )
}
