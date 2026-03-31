import { useState, useRef, useEffect } from "react"
import ScanQR from "../Components/ScanQR"
import api from "../Lib/axios"
import { Clock, Users, Utensils, Phone, Mail, Calendar, Hash, ArrowRight, Camera, XCircle, CheckCircle2, AlertCircle } from "lucide-react"

/* ============================================================
   🚀 SUB-COMPONENT: SCANNER CARD (Left Panel)
   ============================================================ */
function ScannerCard({ onScan, loading }) {
  return (
    <div className="relative h-full flex flex-col bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 p-6 md:p-8">
      
      {/* 1. Top Status Badge (Moved closer) */}
      <div className="mb-4 flex justify-center">
         <div className="flex items-center gap-2 px-5 py-2 bg-emerald-500/10 backdrop-blur-md rounded-full border border-emerald-400/30">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]"></div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Scanner</span>
            <Camera size={14} className="text-emerald-400 ml-1" />
         </div>
      </div>

      {/* 2. MAIN SCANNER FRAME (Visually Dominant) */}
      <div className="flex-1 flex items-center justify-center min-h-0">
         <div className="relative w-full max-w-[720px] aspect-square rounded-[3rem] overflow-hidden border-[6px] border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.3)] group bg-black/40">
            
            {/* Pure Camera Feed */}
            <ScanQR onDetected={onScan} />

            {/* ONE Integrated Frame Frame Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8 lg:p-12">
               
               {/* Target Brackets (Thicker & Brighter) */}
               <div className="w-full h-full relative opacity-90">
                  {/* TL */}
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-[10px] border-l-[10px] border-emerald-500 rounded-tl-3xl shadow-[0_0_20px_rgba(16,185,129,0.8)]"></div>
                  {/* TR */}
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-[10px] border-r-[10px] border-emerald-500 rounded-tr-3xl shadow-[0_0_20px_rgba(16,185,129,0.8)]"></div>
                  {/* BL */}
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[10px] border-l-[10px] border-emerald-500 rounded-bl-3xl shadow-[0_0_20px_rgba(16,185,129,0.8)]"></div>
                  {/* BR */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[10px] border-r-[10px] border-emerald-500 rounded-br-3xl shadow-[0_0_20px_rgba(16,185,129,0.8)]"></div>
                  
                  {/* Laser Line Animation (Centrally constrained to brackets) */}
                  <div className="absolute top-0 left-2 right-2 h-1 bg-emerald-500 shadow-[0_0_30px_#10b981] opacity-70 animate-scan-line"></div>
               </div>
            </div>

            {/* Loading Mask (Overlay inside scanner) */}
            {loading && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
                 <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                 <p className="mt-4 text-emerald-400 font-black uppercase tracking-widest text-xs">Verifying Identity...</p>
              </div>
            )}
         </div>
      </div>

      {/* 3. Bottom Label (Aligned closer) */}
      <div className="mt-4 text-center">
         <h2 className="text-3xl font-black text-white tracking-tight">Scan Student QR</h2>
         <p className="text-indigo-400/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Ready for next detection</p>
      </div>
    </div>
  )
}

/* ============================================================
   🚀 SUB-COMPONENT: SCAN RESULT CARD (Right Top Panel)
   ============================================================ */
function ScanResultCard({ status, formatDate }) {
  if (!status) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-zinc-100 text-zinc-300">
         <div className="w-16 h-16 bg-zinc-50 rounded-[2rem] mb-4 flex items-center justify-center shadow-inner">
            <Users size={28} />
         </div>
         <p className="text-xs font-black uppercase tracking-[0.2em]">Awaiting Scan</p>
         <p className="text-[9px] font-bold text-zinc-400 mt-2 tracking-tighter">Student details will update instantly</p>
      </div>
    )
  }

  const isSuccess = status.type === "success"
  const isWarning = status.type === "warning"
  
  const bgClass = isSuccess 
    ? "bg-gradient-to-r from-emerald-100 to-emerald-200 border-emerald-300"
    : isWarning 
    ? "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300"
    : "bg-gradient-to-r from-rose-100 to-rose-200 border-rose-300"

  const iconClass = isSuccess ? "text-emerald-500" : isWarning ? "text-amber-500" : "text-rose-600"
  const StatusIcon = isSuccess ? CheckCircle2 : isWarning ? AlertCircle : XCircle

  return (
    <div className={`h-full p-6 rounded-[2.5rem] border-2 shadow-sm transition-all duration-500 flex flex-col ${bgClass}`}>
      
      {/* 1. Result Header */}
      <div className="flex items-center gap-4 mb-8">
         <StatusIcon size={36} className={iconClass} strokeWidth={3} />
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-0.5 text-zinc-900">Verification Status</p>
            <h4 className="text-xl font-black text-zinc-900 tracking-tight leading-tight">{status.text}</h4>
         </div>
      </div>

      {/* 2. User Info Section */}
      <div className="flex-1 flex gap-6 items-start">
         <img 
            src={status.customer.photo_url} 
            className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white shadow-xl" 
            alt="" 
         />

         <div className="flex-1 space-y-4 pt-1">
            <div>
               <h3 className="text-2xl font-black text-zinc-900 leading-none">{status.customer.name}</h3>
               <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-900 text-white rounded-full">
                  <span className="text-[9px] font-black tracking-widest uppercase">ID: {status.customer.id}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
               <div className="flex items-center gap-2 opacity-80">
                  <Phone size={12} className="text-zinc-600" />
                  <p className="text-xs font-black text-zinc-800">{status.customer.phone || "—"}</p>
               </div>
               <div className="flex items-center gap-2 opacity-80">
                  <Mail size={12} className="text-zinc-600" />
                  <p className="text-xs font-black text-zinc-800 truncate max-w-[170px]">{status.customer.email || "—"}</p>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Subscription Footer */}
      <div className="mt-auto pt-6 border-t border-black/10 flex items-center justify-between">
         <div className="space-y-0.5">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Expire Date</p>
            <p className="text-sm font-black text-zinc-900">{formatDate(status.customer.subscription_expiry)}</p>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Remaining</p>
            <p className={`text-xl font-black ${status.customer.days_left <= 3 ? 'text-rose-600' : 'text-emerald-700'}`}>
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
      <div className="flex items-center justify-between mb-4 px-1">
         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
           <Clock size={14} className="text-emerald-500" /> Last 3 Scans
         </h3>
         <ArrowRight size={14} className="text-zinc-200" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar">
         {scans.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale gap-2">
               <Utensils size={32} />
               <p className="text-[10px] font-black uppercase">No Scans Recorded</p>
            </div>
         ) : (
            scans.slice(0, 3).map((scan) => (
               <div key={scan.id} className="flex items-center gap-4 p-3 bg-zinc-50/50 rounded-2xl border border-zinc-100 group">
                  <img src={scan.photo_url} className="w-10 h-10 rounded-xl object-cover border border-zinc-100 shadow-sm transition group-hover:scale-105" alt="" />
                  <div className="flex-1 min-w-0">
                     <p className="text-xs font-black text-zinc-800 truncate tracking-tight uppercase">{scan.name}</p>
                     <p className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-0.5">{scan.session}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-zinc-900">{new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                     <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-tighter">Today</p>
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
      
      {/* 🚀 Top Header (Fixed Height) */}
      <div className="flex-shrink-0 mb-6 px-2">
         <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Attendance Scanner</h1>
         <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Meal Redemption System</p>
         </div>
      </div>

      {/* 🚀 Main Split Layout (Grid) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        
        {/* LEFT: SCANNER (50%) - Pushed towards 720px max */}
        <div className="h-full min-h-0 overflow-hidden">
           <ScannerCard onScan={handleScan} loading={loading} />
        </div>

        {/* RIGHT: OUTPUT & HISTORY (50%) */}
        <div className="h-full flex flex-col gap-6 min-h-0 overflow-hidden">
           {/* Section 1: Result Display (Larger Area) */}
           <div className="flex-[6] min-h-0">
              <ScanResultCard status={status} formatDate={formatDate} />
           </div>

           {/* Section 2: Recent Activity (Compact) */}
           <div className="flex-[4] min-h-0">
              <LastScansList scans={recentScans} />
           </div>
        </div>
      </div>
    </div>
  )
}