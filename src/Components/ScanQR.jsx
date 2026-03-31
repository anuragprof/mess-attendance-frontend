import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'

export default function ScanQR({ onDetected }) {
  const [error, setError] = useState(null)

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white border-2 border-blue-200 rounded-2xl shadow-lg p-5">
      <div className="mb-4 text-lg font-bold text-blue-700 tracking-tight">Scan Student QR</div>
      <div className="rounded-2xl border-4 border-emerald-500 overflow-hidden">
        <Scanner
          onScan={(result) => {
            if (result?.[0]?.rawValue) onDetected(result[0].rawValue)
          }}
          onError={(err) => setError(err?.message || 'Camera error')}
          constraints={{ facingMode: 'environment' }}
          styles={{ container: { width: '100%' }, video: { width: '100%' } }}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
