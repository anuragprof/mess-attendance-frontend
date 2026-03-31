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
    <div className="min-h-screen bg-zinc-100 py-12 px-6 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto w-full">
        
        {/* 🏷 Heading: Scaled-up and balanced Title */}
        <div className="mb-12 text-center lg:text-left">
              <h1 className="text-3xl xl:text-4xl font-black text-zinc-900 tracking-tight flex flex-col lg:flex-row lg:items-center gap-4">
                  Attendance Scanner
                  <span className="hidden lg:block w-2 h-2 rounded-full bg-zinc-300"></span>
                  <span className="text-zinc-400 font-bold text-base uppercase tracking-[0.35em]">Live Meal Redemption System</span>
              </h1>
        </div>

        {/* 🚀 Scaled-up 12-Column Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* 📷 LEFT: LARGE SCANNER (lg:col-span-7) - Scaled Dominance */}
          <div className="lg:col-span-7 flex justify-center items-start">
              <div className="w-full max-w-[520px] xl:max-w-[580px] p-2 hover:scale-[1.01] transition-transform duration-500">
                 <ScanQR onDetected={handleScan} />
              </div>
          </div>

          {/* 📋 RIGHT: DETAILS & HISTORY (lg:col-span-5) - Balanced Scaling */}
          <div className="lg:col-span-5 flex flex-col space-y-8">
                
                {/* Section 1: Recent Scan Result Header Card */}
                <div className="animate-in fade-in slide-in-from-right duration-500">
                    <Card title="Recent Scan Output" className={`p-8 xl:p-10 ${getCardStatusStyle()}`}>
                        {loading ? (
                           <div className="py-24 flex flex-col items-center justify-center gap-6">
                              <div className="w-14 h-14 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                              <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Authorizing Ticket...</p>
                           </div>
                        ) : status?.customer ? (
                           <div className="space-y-8">
                              {/* Integrated Large Status Banner */}
                              <div className="flex items-center gap-5">
                                 <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md ${status.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'}`}>
                                    {status.type === "success" ? "✓" : "✕"}
                                 </div>
                                 <h4 className="text-2xl font-black tracking-tight text-zinc-900 leading-tight">{status.text}</h4>
                              </div>

                              {/* Student Identity Card Segment */}
                              <div className="flex gap-8 items-start">
                                 <div className="relative">
                                    <div className="absolute -inset-1 bg-zinc-900/5 rounded-[2.5rem] blur-xl"></div>
                                    <img 
                                       src={status.customer.photo_url} 
                                       className="relative w-36 h-36 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl flex-shrink-0" 
                                       alt="" 
                                    />
                                 </div>
                                 <div className="flex-1 space-y-6 pt-2">
                                    <div>
                                       <h3 className="text-3xl font-black text-zinc-900 leading-none">{status.customer.name}</h3>
                                       <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                                          <Hash size={12} className="text-emerald-400" />
                                          <span className="text-xs font-black tracking-[0.1em]">CUST-{status.customer.id}</span>
                                       </div>
                                    </div>
                                    <div className="space-y-3">
                                       <div className="flex items-center gap-3 text-zinc-600">
                                          <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center"><Phone size={14} className="text-emerald-500" /></div>
                                          <p className="text-sm font-bold tracking-tight">{status.customer.phone || "—"}</p>
                                       </div>
                                       <div className="flex items-center gap-3 text-zinc-600">
                                          <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center"><Mail size={14} className="text-blue-500" /></div>
                                          <p className="text-sm font-bold truncate max-w-[200px] tracking-tight">{status.customer.email || "—"}</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Subscription Timeline Row */}
                              <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                                 <div className="space-y-1.5">
                                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">Days Remaining</p>
                                    <p className={`text-2xl font-black ${status.customer.days_left <= 3 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                       {status.customer.days_left} Days
                                    </p>
                                 </div>
                                 <div className="text-right space-y-1.5">
                                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">Expiry Date</p>
                                    <p className="text-base font-black text-zinc-800">{formatDate(status.customer.subscription_expiry)}</p>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="py-24 border-2 border-dashed border-zinc-100 rounded-[3rem] flex flex-col items-center justify-center text-zinc-300 group hover:border-zinc-200 transition-colors">
                              <ShieldCheck size={48} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
                              <p className="text-sm font-black uppercase tracking-[0.3em] mt-5">Security Protocol Ready</p>
                           </div>
                        )}
                    </Card>
                </div>

                {/* Section 2: Last Scans List Card */}
                <div className="animate-in fade-in slide-in-from-bottom duration-700">
                    <Card title="Last 3 Scans" className="p-8 xl:p-10 !bg-white">
                        <div className="space-y-2">
                           {recentScans.length === 0 ? (
                              <div className="py-12 text-center text-zinc-300 text-xs font-black uppercase tracking-widest">No Historical Logs</div>
                           ) : (
                              recentScans.slice(0, 3).map((scan) => (
                                 <div key={scan.id} className="flex items-center justify-between py-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors px-3 rounded-2xl group">
                                    <div className="flex items-center gap-5">
                                       <img src={scan.photo_url} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
                                       <div className="min-w-0 pr-4">
                                          <p className="text-base font-black text-zinc-900 truncate tracking-tight uppercase leading-none">{scan.name}</p>
                                          <div className="inline-flex items-center gap-2 mt-2 px-2 py-0.5 bg-emerald-50 rounded-md">
                                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                             <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">{scan.session}</p>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="text-[11px] font-black text-zinc-400 flex items-center gap-2 uppercase flex-shrink-0 group-hover:text-zinc-900 transition-colors">
                                       <Clock size={12} className="text-zinc-300 group-hover:text-emerald-500" />
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