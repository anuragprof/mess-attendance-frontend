import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Camera, AlertCircle } from 'lucide-react'

export default function ScanQR({ onDetected }) {
  const [error, setError] = useState(null)

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-[min(450px,80vh)] aspect-square group">
        
        {/* Modern Thick Border Container */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
        
        <div className="relative h-full w-full bg-white rounded-[3rem] border-4 border-white shadow-2xl overflow-hidden ring-4 ring-zinc-50">
          
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
              finder: false // We will draw our own premium finder
            }}
          />

          {/* Premium Brackets & Pulse Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            
             {/* Pulsing Target Area Brackets */}
             <div className="w-2/3 aspect-square relative opacity-80 animate-pulse-gentle">
                {/* TL */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-8 border-l-8 border-emerald-500 rounded-tl-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                {/* TR */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-8 border-r-8 border-emerald-500 rounded-tr-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                {/* BL */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-8 border-l-8 border-emerald-500 rounded-bl-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                {/* BR */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-8 border-r-8 border-emerald-500 rounded-br-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                
                {/* Scanning Laser Line (Animated) */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_20px_#10b981] opacity-60 animate-scan-line"></div>
             </div>

             {/* Status Badge */}
             <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Live Scanner</span>
                <Camera size={12} className="text-emerald-400 ml-1" />
             </div>
          </div>

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-x-8 bottom-8 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom duration-300">
               <AlertCircle className="text-rose-600 flex-shrink-0" size={20} />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 leading-none mb-1">Camera Issue</p>
                  <p className="text-sm font-bold text-rose-700">{error}</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
