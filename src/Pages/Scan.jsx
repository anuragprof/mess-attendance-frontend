import { useState, useRef, useEffect } from "react"
import ScanQR from "../Components/ScanQR"
import Card from "../Components/Card"
import api from "../Lib/axios"
import { Clock, Users, Utensils, Phone, Mail, Calendar, Hash, ArrowRight, Camera, AlertCircle, XCircle, CheckCircle2, Info } from "lucide-react"

/* ============================================================
   🚀 SUB-COMPONENT: SCANNER CARD (Left Panel)
   ============================================================ */
function ScannerCard({ onScan, loading }) {
  return (
    <div className="relative h-full flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5">
      
      {/* 1. Top Status Pill */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
         <div className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/10 backdrop-blur-md rounded-full border border-emerald-400/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></div>
            <span className="text-[12px] font-black uppercase tracking-[0.3em] text-emerald-400">Live Scanner</span>
            <Camera size={14} className="text-emerald-400 ml-1" />
         </div>
      </div>

      {/* 2. Main Scanner Body */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
         <div className="relative w-full max-w-[500px] aspect-square group">
            {/* The Outer Glow Ring */}
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            
            {/* The Scanner Container */}
            <div className="relative h-full w-full bg-black/40 rounded-[3rem] border-4 border-white/10 shadow-inner overflow-hidden flex items-center justify-center">
               <ScanQR onDetected={onScan} />
            </div>
         </div>
      </div>

      {/* 3. Bottom Label */}
      <div className="pb-12 text-center">
         <h2 className="text-4xl font-black text-white tracking-tight">Scan Student QR</h2>
         <p className="text-indigo-400/60 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Position the ticket in the center frame</p>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-50">
           <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
           <p className="mt-4 text-emerald-400 font-black uppercase tracking-widest text-xs">Authenticating...</p>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   🚀 SUB-COMPONENT: SCAN RESULT CARD (Right Top Panel)
   ============================================================ */
function ScanResultCard({ status, formatDate }) {
  if (!status) {
    return (
      <div className="h-[420px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-zinc-100 text-zinc-300">
         <div className="w-20 h-20 bg-zinc-50 rounded-[2.5rem] mb-4 flex items-center justify-center shadow-inner">
            <Users size={32} />
         </div>
         <p className="text-sm font-black uppercase tracking-[0.2em]">Awaiting Scan</p>
         <p className="text-[10px] font-bold text-zinc-400 mt-2">Latest student details will appear here</p>
      </div>
    )
  }

  const isSuccess = status.type === "success"
  const isWarning = status.type === "warning"
  
  const bgClass = isSuccess 
    ? "bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-200"
    : isWarning 
    ? "bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200"
    : "bg-gradient-to-br from-rose-50 to-red-100 border-rose-200"

  const iconClass = isSuccess ? "text-emerald-500" : isWarning ? "text-amber-500" : "text-rose-500"
  const StatusIcon = isSuccess ? CheckCircle2 : isWarning ? AlertCircle : XCircle

  return (
    <div className={`h-full min-h-[420px] p-8 rounded-[2.5rem] border-2 shadow-sm transition-all duration-500 flex flex-col ${bgClass}`}>
      
      {/* 1. Result Header */}
      <div className="flex items-center gap-4 mb-10">
         <StatusIcon size={40} className={iconClass} strokeWidth={2.5} />
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5">Verification Status</p>
            <h4 className="text-2xl font-black text-zinc-900 tracking-tight leading-tight">{status.text}</h4>
         </div>
      </div>

      {/* 2. User Info Section */}
      <div className="flex-1 flex gap-8 items-start">
         <div className="relative group">
            <div className="absolute -inset-2 bg-zinc-900/5 rounded-[2.5rem] blur transition group-hover:opacity-100"></div>
            <img 
               src={status.customer.photo_url} 
               className="relative w-36 h-36 rounded-[2rem] object-cover border-4 border-white shadow-2xl" 
               alt="" 
            />
         </div>

         <div className="flex-1 space-y-6 pt-1">
            <div>
               <h3 className="text-3xl font-black text-zinc-900 leading-none truncate max-w-[220px]">{status.customer.name}</h3>
               <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full">
                  <span className="text-[10px] font-black tracking-widest uppercase">CUST-{status.customer.id}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm`}><Phone size={14} className="text-zinc-400" /></div>
                  <p className="text-sm font-black text-zinc-800">{status.customer.phone || "—"}</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm`}><Mail size={14} className="text-zinc-400" /></div>
                  <p className="text-sm font-black text-zinc-800 truncate max-w-[180px]">{status.customer.email || "—"}</p>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Subscription Footer */}
      <div className="mt-auto pt-8 border-t border-black/5 flex items-center justify-between">
         <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
               <Calendar size={10} /> Expire Date
            </p>
            <p className="text-base font-black text-zinc-800">{formatDate(status.customer.subscription_expiry)}</p>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Days Remaining</p>
            <p className={`text-2xl font-black ${status.customer.days_left <= 3 ? 'text-rose-600' : 'text-emerald-700'}`}>
               {status.customer.days_left} Days
            </p>
         </div>
      </div>
    </div>
  )
}

/* ============================================================
   🚀 SUB-COMPONENT: LAST SCANS LIST (Right Bottom Panel)
   ============================================================ */
function LastScansList({ scans }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-zinc-100 shadow-sm flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-5 px-2">
         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
           <Clock size={14} className="text-emerald-500" /> Last 3 Scans
         </h3>
         <ArrowRight size={14} className="text-zinc-200" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
         {scans.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale gap-2">
               <Utensils size={32} />
               <p className="text-[10px] font-black uppercase">No Recent Activity</p>
            </div>
         ) : (
            scans.slice(0, 3).map((scan) => (
               <div key={scan.id} className="flex items-center gap-4 p-3.5 bg-zinc-50/50 rounded-[1.5rem] border border-zinc-100 hover:bg-white hover:shadow-md transition-all group">
                  <div className="relative">
                     <img src={scan.photo_url} className="w-12 h-12 rounded-xl object-cover border border-zinc-100 shadow-sm transition group-hover:scale-105" alt="" />
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <p className="text-sm font-black text-zinc-800 truncate tracking-tight uppercase">{scan.name}</p>
                     <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-100/50 px-1.5 py-0.5 rounded">{scan.session}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[11px] font-black text-zinc-900">{new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                     <p className="text-[8px] font-bold text-zinc-300 uppercase">Today</p>
                  </div>
               </div>
            ))
         )}
      </div>
    </div>
  )
}

/* ============================================================
   🚀 MAIN PAGE: ATTENDANCE SCANNER
   ============================================================ */
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
          type = "error"
          speak("Already redeemed")
          break

        case "daily_limit_reached":
          type = "warning"
          speak("Daily limit reached")
          break

        case "expired":
          type = "error"
          speak("Subscription expired")
          break

        case "plan_completed":
          type = "error"
          speak("Plan completed")
          break

        default:
          type = "error"
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

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="h-screen flex flex-col p-4 md:-m-4 md:p-10 bg-[#f8fafc] overflow-hidden">
      
      {/* 🚀 Top Header (Pixel Match) */}
      <div className="flex-shrink-0 mb-8 px-2">
         <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Attendance Scanner</h1>
         <div className="mt-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Live Meal Redemption System</p>
         </div>
      </div>

      {/* 🚀 Main Split Layout (Grid) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 overflow-hidden">
        
        {/* LEFT: SCANNER (50%) */}
        <div className="h-full min-h-0 overflow-hidden">
           <ScannerCard onScan={handleScan} loading={loading} />
        </div>

        {/* RIGHT: OUTPUT & HISTORY (50%) */}
        <div className="h-full flex flex-col gap-8 min-h-0 overflow-hidden">
           {/* Section 1: Result Display */}
           <div className="flex-[5] min-h-0">
              <ScanResultCard status={status} formatDate={formatDate} />
           </div>

           {/* Section 2: Recent Activity */}
           <div className="flex-[3] min-h-0">
              <LastScansList scans={recentScans} />
           </div>
        </div>
      </div>
    </div>
  )
}