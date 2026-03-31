import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Camera, AlertCircle } from 'lucide-react'

export default function ScanQR({ onDetected }) {
  const [error, setError] = useState(null)

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-between shadow-2xl relative overflow-hidden">
      
      {/* Decorative Background Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>

      {/* Top Status Pill */}
      <div className="flex items-center gap-2 px-5 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-6">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Live Scanner</span>
      </div>

      {/* Scanner Box Container */}
      <div className="relative w-full max-w-[620px] xl:max-w-[680px] aspect-square group">
        
        {/* Neon Corner Brackets */}
        <div className="absolute -inset-2 z-20 pointer-events-none">
           {/* Top Left */}
           <div className="absolute top-0 left-0 w-14 h-14 border-t-[8px] border-l-[8px] border-emerald-400 rounded-tl-3xl shadow-[0_0_20px_rgba(52,211,153,0.5)]"></div>
           {/* Top Right */}
           <div className="absolute top-0 right-0 w-14 h-14 border-t-[8px] border-r-[8px] border-emerald-400 rounded-tr-3xl shadow-[0_0_20px_rgba(52,211,153,0.5)]"></div>
           {/* Bottom Left */}
           <div className="absolute bottom-0 left-0 w-14 h-14 border-b-[8px] border-l-[8px] border-emerald-400 rounded-bl-3xl shadow-[0_0_20px_rgba(52,211,153,0.5)]"></div>
           {/* Bottom Right */}
           <div className="absolute bottom-0 right-0 w-14 h-14 border-b-[8px] border-r-[8px] border-emerald-400 rounded-br-3xl shadow-[0_0_20px_rgba(52,211,153,0.5)]"></div>
           
           {/* Animated Laser Line */}
           <div className="absolute left-6 right-6 h-1 bg-emerald-400 shadow-[0_0_30px_#10b981] opacity-70 animate-scan-line-full z-30"></div>
        </div>

        {/* Camera Preview Render */}
        <div className="relative h-full w-full rounded-[3rem] overflow-hidden border-8 border-white/5 bg-black/40 ring-1 ring-white/10 shadow-2xl">
          <Scanner
            onScan={(result) => {
              if (result?.[0]?.rawValue) onDetected(result[0].rawValue)
            }}
            onError={(err) => setError(err?.message || 'Camera error')}
            constraints={{ facingMode: 'environment' }}
            allowMultiple={true}
            scanDelay={1500}
            styles={{ 
                container: { width: '100%', height: '100%' },
                video: { width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }
            }}
            components={{ audio: false, torch: false, finder: false }}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 z-40 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-[2rem]">
             <AlertCircle className="text-rose-500 mb-3" size={40} />
             <p className="text-sm font-black text-white/90 uppercase tracking-widest">{error}</p>
             <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase text-white hover:bg-white/20 transition">Retry Camera</button>
          </div>
        )}
      </div>

      {/* Bottom Label */}
      <div className="mt-8">
        <h2 className="text-3xl font-black text-white tracking-tight text-center">Scan Student QR</h2>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-2">Position card inside frame</p>
      </div>

    </div>
  )
}
