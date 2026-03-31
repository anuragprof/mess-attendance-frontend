import { useState, useRef, useEffect } from "react"
import ScanQR from "../Components/ScanQR"
import Card from "../Components/Card"
import api from "../Lib/axios"
import { Clock, Users, Utensils, Phone, Mail, Calendar, Hash, ArrowRight, Camera, AlertCircle, CheckCircle, XCircle } from "lucide-react"

/* ============================================================ */
/* 🛠️ SUB-COMPONENTS for PIXEL-PERFECT REPLICATION */
/* ============================================================ */

// 1. LEFT SECTION: SCANNER CARD
function ScannerCard({ onDetected }) {
  return (
    <div className="relative h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 shadow-2xl border border-white/5 overflow-hidden group">
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 blur-[120px] pointer-events-none"></div>

      {/* Top Pill Status */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2 px-6 py-2.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">Live Scanner</span>
          <Camera size={14} className="text-white/60 ml-1" />
        </div>
      </div>

      {/* Center Scan Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-[450px] aspect-square rounded-[3rem] p-2 bg-slate-800/50 backdrop-blur-md shadow-inner ring-1 ring-white/10 overflow-hidden">
           {/* Custom Scanner Frame Overlay (Neon Green Corners) */}
           <div className="absolute inset-4 z-10 pointer-events-none">
              {/* TL */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-8 border-l-8 border-[#00ff9d] rounded-tl-2xl shadow-[0_0_15px_rgba(0,255,157,0.4)]"></div>
              {/* TR */}
              <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-[#00ff9d] rounded-tr-2xl shadow-[0_0_15px_rgba(0,255,157,0.4)]"></div>
              {/* BL */}
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-[#00ff9d] rounded-bl-2xl shadow-[0_0_15px_rgba(0,255,157,0.4)]"></div>
              {/* BR */}
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-8 border-r-8 border-[#00ff9d] rounded-br-2xl shadow-[0_0_15px_rgba(0,255,157,0.4)]"></div>
              
              {/* Vertical Scan Line Animation */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#00ff9d] shadow-[0_0_25px_#00ff9d] opacity-80 animate-scan-line"></div>
           </div>

           {/* QR Component */}
           <div className="w-full h-full rounded-[2.5rem] overflow-hidden opacity-90 grayscale-[0.2] transition-all group-hover:grayscale-0">
              <ScanQR onDetected={onDetected} />
           </div>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-3xl font-black text-white tracking-tight">Scan Student QR</h2>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">Position QR Code within the frame</p>
      </div>
    </div>
  )
}

// 2. RIGHT SECTION: SCAN RESULT CARD
function ScanResultCard({ status, loading }) {
  const getStatusColorClasses = () => {
    if (!status) return "bg-white border-zinc-100"
    if (status.type === "success") 
        return "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200"
    if (status.type === "warning")
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
    return "bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200"
  }

  const getStatusTextClasses = () => {
    if (!status) return "text-zinc-400"
    if (status.type === "success") return "text-emerald-700"
    if (status.type === "warning") return "text-amber-700"
    return "text-rose-700"
  }

  return (
    <div className={`p-8 rounded-[2.5rem] border-2 shadow-sm transition-all duration-500 overflow-hidden relative ${getStatusColorClasses()}`}>
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
           <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
           <p className="text-xs font-black uppercase tracking-widest text-emerald-800/60">Verifying Identity...</p>
        </div>
      ) : status?.customer ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500">
           {/* Top Message (Pixel Match) */}
           <div className="flex items-center gap-3">
              {status.type === "success" ? (
                <CheckCircle className="text-emerald-500" size={28} />
              ) : (
                <XCircle className="text-rose-500" size={28} />
              )}
              <h4 className={`text-xl font-black tracking-tight ${getStatusTextClasses()}`}>
                {status.text}
              </h4>
           </div>

           {/* User Split View */}
           <div className="flex gap-8 items-start">
              <img 
                src={status.customer.photo_url} 
                className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-xl" 
                alt="" 
              />
              <div className="flex-1 space-y-5 pt-2">
                 <div>
                    <p className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-1">Customer Identity</p>
                    <h3 className="text-3xl font-black text-slate-900 leading-none">{status.customer.name}</h3>
                    <div className="mt-2.5 inline-flex bg-slate-900 text-white rounded-full px-3 py-1">
                       <span className="text-[10px] font-black tracking-[0.2em] uppercase">CUST-{status.customer.id}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Phone</p>
                       <p className="text-sm font-bold text-slate-800">{status.customer.phone || "—"}</p>
                    </div>
                    <div className="space-y-1 overflow-hidden">
                       <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Email</p>
                       <p className="text-sm font-bold text-slate-800 truncate">{status.customer.email || "—"}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Footer Stats Row */}
           <div className="pt-8 border-t border-black/5 flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Plan Expiry</p>
                 <p className="text-base font-black text-slate-900">
                    {new Date(status.customer.subscription_expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                 </p>
              </div>
              <div className="text-right space-y-1">
                 <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Days Remaining</p>
                 <p className={`text-2xl font-black ${status.customer.days_left <= 3 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {status.customer.days_left} Days
                 </p>
              </div>
           </div>
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-zinc-300 opacity-50">
           <Users size={48} strokeWidth={1.5} />
           <p className="text-sm font-black uppercase tracking-[0.2em] mt-4">Awaiting QR Identity</p>
        </div>
      )}
    </div>
  )
}

// 3. RIGHT SECTION: LAST SCANS LIST
function LastScansList({ recentScans }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
       <div className="px-8 py-6 border-b border-zinc-50 bg-zinc-50/30 flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Last Scans</h3>
          <ArrowRight size={16} className="text-zinc-300" />
       </div>
       <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {recentScans.length === 0 ? (
            <div className="py-12 text-center text-zinc-300 text-xs italic">No activity yet</div>
          ) : (
            recentScans.slice(0, 5).map((scan) => (
              <div key={scan.id} className="flex items-center gap-4 p-3.5 bg-zinc-50/50 rounded-3xl border border-white hover:bg-white hover:shadow-md transition-all group">
                 <img src={scan.photo_url} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 tracking-tight">{scan.name}</p>
                    <div className="flex items-center gap-2.5 mt-0.5">
                       <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">{scan.session}</span>
                       <span className="text-[10px] font-medium text-zinc-400">
                          {new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                 </div>
                 <div className="w-8 h-8 rounded-full bg-zinc-50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-emerald-500 transition-all">
                    <CheckCircle size={16} />
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  )
}

/* ============================================================ */
/* 🚀 MAIN PAGE COMPONENT */
/* ============================================================ */

export default function Scan() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recentScans, setRecentScans] = useState([])

  const lastScanRef = useRef(null)
  const scanLockRef = useRef(false)

  /* ================= VOICE FEEDBACK ================= */
  function speak(text) {
    if (!window.speechSynthesis) return
    const msg = new SpeechSynthesisUtterance(text)
    msg.lang = "en-US"
    msg.rate = 0.9
    msg.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(msg)
  }

  const fetchRecentScans = async () => {
    try {
      const res = await api.get("/scan/recent")
      setRecentScans(res.data)
    } catch (err) {
      console.error("Failed to fetch recent scans")
    }
  }

  useEffect(() => {
    fetchRecentScans()
  }, [])

  async function handleScan(code) {
    if (!code) return
    if (scanLockRef.current) return
    if (code === lastScanRef.current) return

    scanLockRef.current = true
    lastScanRef.current = code

    setLoading(true)
    setStatus(null)

    try {
      const res = await api.post("/scan/", { qr_value: code })
      const backendStatus = res.data.status

      let type = "error"
      switch (backendStatus) {
        case "success":
          type = "success"
          speak("Successful")
          fetchRecentScans()
          break
        case "already_redeemed":
          speak("Already redeemed")
          break
        case "daily_limit_reached":
          type = "warning"
          speak("Daily limit reached")
          break
        case "expired":
          speak("Subscription expired")
          break
        case "plan_completed":
          speak("Plan completed")
          break
        default:
          speak("Invalid QR code")
      }

      setStatus({
        type,
        text: res.data.message,
        customer: res.data.customer,
      })
    } catch (e) {
      setStatus({
        type: "error",
        text: e?.response?.data?.detail || "Scan failed",
      })
      speak("Scan failed")
    } finally {
      setLoading(false)
      setTimeout(() => {
        scanLockRef.current = false
      }, 2000)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-inter -m-4 md:-m-8 p-4 md:p-10">
      
      {/* 🔝 HEADER PIXEL MATCH */}
      <header className="flex-shrink-0 flex items-center justify-between mb-10 px-2">
         <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Attendance Scanner</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
               <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
               Live Meal Redemption System
            </p>
         </div>
      </header>

      {/* 🎞️ MAIN GRID REPLICATION (55% / 45%) */}
      <main className="flex-1 flex flex-col lg:flex-row gap-10 overflow-hidden">
        
        {/* LEFT COLUMN: SCANNER BOX */}
        <section className="lg:flex-[1.2] flex flex-col overflow-hidden">
           <ScannerCard onDetected={handleScan} />
        </section>

        {/* RIGHT COLUMN: STATUS & HISTORY */}
        <section className="lg:flex-[1] flex flex-col gap-10 min-h-0 overflow-hidden">
           <div className="flex-1 overflow-y-auto flex flex-col gap-10 pr-2 custom-scrollbar">
              <ScanResultCard status={status} loading={loading} />
              <div className="flex-1 min-h-[300px] flex flex-col">
                 <LastScansList recentScans={recentScans} />
              </div>
           </div>
        </section>

      </main>
    </div>
  )
}