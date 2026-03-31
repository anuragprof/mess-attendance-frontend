import { useState, useRef, useEffect } from "react"
import ScanQR from "../Components/ScanQR"
import Card from "../Components/Card"
import api from "../Lib/axios"
import { Clock, Users, Utensils, Phone, Mail, Calendar, Hash, ArrowRight, ShieldCheck } from "lucide-react"

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

  const getStatusStyle = () => {
    if (!status) return ""
    if (status.type === "success")
      return "bg-emerald-50 border-emerald-200 text-emerald-800"
    if (status.type === "warning")
      return "bg-amber-50 border-amber-200 text-amber-800"
    return "bg-rose-50 border-rose-200 text-rose-700"
  }

  const getCardStatusStyle = () => {
    if (!status) return ""
    if (status.type === "success")
        return "!bg-gradient-to-br !from-emerald-50 !to-emerald-100 !border-emerald-200"
    if (status.type === "warning")
        return "!bg-gradient-to-br !from-amber-50 !to-amber-100 !border-amber-200"
    return "!bg-gradient-to-br !from-rose-50 !to-rose-100 !border-rose-200"
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
    <div className="min-h-screen flex flex-col bg-zinc-100 overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto w-full p-6 md:p-10 space-y-8">
        
        {/* 🏷 Explicit Heading Copy */}
        <div className="flex-shrink-0">
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex flex-col md:flex-row md:items-center gap-3">
                  Attendance Scanner
                  <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                  <span className="text-zinc-400 font-bold text-sm uppercase tracking-[0.25em]">Live Meal Redemption System</span>
              </h1>
        </div>

        {/* 🚀 Proportional 12-Column Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* 📷 LEFT: SCANNER (7/12 slots) - Centered & Dominated */}
          <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-[580px]">
                 <ScanQR onDetected={handleScan} />
              </div>
          </div>

          {/* 📋 RIGHT: DETAILS & HISTORY (5/12 slots) - Compact & Balanced */}
          <div className="lg:col-span-5 flex flex-col gap-8">
                
                {/* Section 1: Recent Scan Result Header Only Card */}
                <div className="animate-in fade-in slide-in-from-right duration-500">
                    <Card title="Recent Scan Output" className={`p-6 ${getCardStatusStyle()}`}>
                        {loading ? (
                           <div className="py-20 flex flex-col items-center justify-center gap-4">
                              <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Verifying Identity...</p>
                           </div>
                        ) : status?.customer ? (
                           <div className="space-y-6">
                              {/* Top High-Stakes Banner */}
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base shadow-sm ${status.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'}`}>
                                    {status.type === "success" ? "✓" : "✕"}
                                 </div>
                                 <h4 className="text-xl font-black tracking-tight text-zinc-900 leading-tight">{status.text}</h4>
                              </div>

                              {/* Student Identity Card Segment */}
                              <div className="flex gap-6 items-start">
                                 <img 
                                    src={status.customer.photo_url} 
                                    className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl flex-shrink-0" 
                                    alt="" 
                                 />
                                 <div className="flex-1 space-y-4 pt-1">
                                    <div>
                                       <h3 className="text-2xl font-black text-zinc-900 leading-none">{status.customer.name}</h3>
                                       <p className="text-[11px] font-black text-emerald-600 mt-2 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">CUST-{status.customer.id}</p>
                                    </div>
                                    <div className="space-y-2">
                                       <div className="flex items-center gap-2 text-zinc-500">
                                          <Phone size={12} className="text-emerald-500" />
                                          <p className="text-xs font-bold">{status.customer.phone || "—"}</p>
                                       </div>
                                       <div className="flex items-center gap-2 text-zinc-500">
                                          <Mail size={12} className="text-blue-500" />
                                          <p className="text-xs font-bold truncate max-w-[180px]">{status.customer.email || "—"}</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Key Metrics Row */}
                              <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Plan Expiry</p>
                                    <p className="text-sm font-black text-zinc-800">{formatDate(status.customer.subscription_expiry)}</p>
                                 </div>
                                 <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Days Left</p>
                                    <p className={`text-xl font-black ${status.customer.days_left <= 3 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                       {status.customer.days_left} Days
                                    </p>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="py-24 border-2 border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-300">
                              <ShieldCheck size={36} strokeWidth={1} />
                              <p className="text-xs font-black uppercase tracking-[0.2em] mt-4">Scanner Ready</p>
                           </div>
                        )}
                    </Card>
                </div>

                {/* Section 2: Last Scans List */}
                <div className="animate-in fade-in slide-in-from-bottom duration-700">
                    <Card title="Last 3 Scans" className="p-6 !bg-white">
                        <div className="space-y-1">
                           {recentScans.length === 0 ? (
                              <div className="py-12 text-center text-zinc-300 text-[10px] uppercase font-black tracking-widest">Awaiting First Scan</div>
                           ) : (
                              recentScans.slice(0, 3).map((scan) => (
                                 <div key={scan.id} className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors px-2 rounded-xl group">
                                    <div className="flex items-center gap-4">
                                       <img src={scan.photo_url} className="w-11 h-11 rounded-1.5xl object-cover border border-zinc-100 shadow-sm" alt="" />
                                       <div className="min-w-0">
                                          <p className="text-sm font-black text-zinc-900 truncate tracking-tight uppercase">{scan.name}</p>
                                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">{scan.session}</p>
                                       </div>
                                    </div>
                                    <div className="text-[10px] font-black text-zinc-400 flex items-center gap-1.5 uppercase group-hover:text-zinc-900 transition-colors">
                                       <Clock size={10} />
                                       {new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                 </div>
                              ))
                       )}
                    </div>
                 </Card>
              </div>

          </div>
        </div>
      </div>
    </div>
  )
}