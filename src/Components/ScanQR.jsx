import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { AlertCircle } from 'lucide-react'

export default function ScanQR({ onDetected }) {
  const [error, setError] = useState(null)

  return (
    <div className="w-full h-full relative group">
      <Scanner
        onScan={(result) => {
          if (result?.[0]?.rawValue) onDetected(result[0].rawValue)
        }}
        onError={(err) => setError(err?.message || 'Camera error')}
        constraints={{ facingMode: 'environment' }}
        allowMultiple={true}
        scanDelay={1000}
        styles={{ 
            container: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
            video: { width: '100%', height: '100%', objectFit: 'cover' }
        }}
        components={{
          audio: false,
          torch: false,
          finder: false // We will draw our own premium finder in the parent
        }}
      />

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-x-8 bottom-8 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom duration-300 z-50">
           <AlertCircle className="text-rose-600 flex-shrink-0" size={20} />
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 leading-none mb-1">Camera Issue</p>
              <p className="text-sm font-bold text-rose-700">{error}</p>
           </div>
        </div>
      )}
    </div>
  )
}
