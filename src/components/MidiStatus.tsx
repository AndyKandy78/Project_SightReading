interface MidiStatusProps {
  connected: boolean
  deviceName: string | null
}

export function MidiStatus({ connected, deviceName }: MidiStatusProps) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${connected ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
      {connected ? (deviceName ?? 'MIDI Device') : 'No MIDI Device'}
    </div>
  )
}
