import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'

export default function ScanQR({ onDetected }) {
  const [error, setError] = useState(null)

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-[400px] aspect-square rounded-[2.5rem] border-[12px] border-zinc-900 overflow-hidden bg-black shadow-2xl relative group">
          <Scanner
            onScan={(result) => {
              if (result?.[0]?.rawValue) onDetected(result[0].rawValue)
            }}
            onError={(err) => setError(err?.message || 'Camera error')}
            constraints={{ facingMode: 'environment' }}
            styles={{ 
              container: { width: '100%', height: '100%' }, 
              video: { width: '100%', height: '100%', objectFit: 'cover' } 
            }}
          />
          
          {/* Scanner Visual Overlay */}
          <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none flex items-center justify-center transition-all group-hover:border-black/20">
             <div className="w-full h-full border-2 border-emerald-500/30 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl animate-pulse" />
                <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-emerald-500 rounded-br-xl animate-pulse" />
             </div>
          </div>
       </div>
       
       {error && (
         <div className="mt-4 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            {error}
         </div>
       )}
       
       <div className="mt-8 text-center space-y-1 px-4">
          <p className="text-zinc-900 font-black text-2xl tracking-tighter">Ready for Scan</p>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
            Position QR code within the frame <br/> to auto-detect identity
          </p>
       </div>
    </div>
  )
}
