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
        return "!bg-gradient-to-br !from-emerald-50 !to-emerald-100 !border-emerald-200 shadow-xl"
    if (status.type === "warning")
        return "!bg-gradient-to-br !from-amber-50 !to-amber-100 !border-amber-200 shadow-xl"
    return "!bg-gradient-to-br !from-rose-50 !to-rose-100 !border-rose-200 shadow-xl"
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
      <div className="max-w-[1600px] mx-auto w-full">
        
        {/* 🏷 Dominant Heading Section */}
        <div className="mb-12 text-center lg:text-left">
              <h1 className="text-4xl xl:text-5xl font-black text-zinc-900 tracking-tighter flex flex-col lg:flex-row lg:items-center gap-5">
                  Attendance Scanner
                  <span className="hidden lg:block w-3 h-3 rounded-full bg-zinc-300"></span>
                  <span className="text-zinc-400 font-bold text-lg uppercase tracking-[0.4em]">Live Meal Redemption System</span>
              </h1>
        </div>

        {/* 🚀 High-Dominance 12-Column Grid Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
          
          {/* 📷 LEFT: OVERSIZED SCANNER (lg:col-span-7) - Maximum Visual Weight */}
          <div className="lg:col-span-7 flex justify-center items-start">
              <div className="w-full max-w-[650px] xl:max-w-[700px] hover:scale-[1.01] transition-transform duration-500">
                 <ScanQR onDetected={handleScan} />
              </div>
          </div>

          {/* 📋 RIGHT: DOMINANT DETAILS & HISTORY (lg:col-span-5) - Balanced Force */}
          <div className="lg:col-span-5 flex flex-col space-y-10">
                
                {/* Section 1: Recent Scan Result Expanded Card */}
                <div className="animate-in fade-in slide-in-from-right duration-500">
                    <Card title="Recent Scan Output" className={`p-8 xl:p-12 ${getCardStatusStyle()}`}>
                        {loading ? (
                           <div className="py-24 flex flex-col items-center justify-center gap-8">
                              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                              <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Accessing Database...</p>
                           </div>
                        ) : status?.customer ? (
                           <div className="space-y-10">
                              {/* Large Operational Status Header */}
                              <div className="flex items-center gap-6">
                                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-b-4 ${status.type === 'success' ? 'bg-emerald-500 text-white border-emerald-700' : 'bg-rose-500 text-white border-rose-700'}`}>
                                    {status.type === "success" ? "✓" : "✕"}
                                 </div>
                                 <h4 className="text-3xl font-black tracking-tighter text-zinc-900 leading-tight">{status.text}</h4>
                              </div>

                              {/* Student Pro-Card Section */}
                              <div className="flex gap-10 items-start">
                                 <div className="relative group">
                                    <div className="absolute -inset-2 bg-zinc-900/10 rounded-[3rem] blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                                    <img 
                                       src={status.customer.photo_url} 
                                       className="relative w-44 h-44 rounded-[3rem] object-cover border-8 border-white shadow-2xl flex-shrink-0" 
                                       alt="" 
                                    />
                                    <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-zinc-100">
                                        <Users size={24} className="text-emerald-500" />
                                    </div>
                                 </div>
                                 <div className="flex-1 space-y-8 pt-4">
                                    <div>
                                       <h3 className="text-4xl font-black text-zinc-900 tracking-tight leading-none">{status.customer.name}</h3>
                                       <div className="mt-5 inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900 text-white rounded-2xl shadow-md">
                                          <Hash size={14} className="text-zinc-500" />
                                          <span className="text-xs font-black tracking-[0.2em] uppercase">Student ID: {status.customer.id}</span>
                                       </div>
                                    </div>
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-4 text-zinc-700">
                                          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center font-black"><Phone size={18} className="text-emerald-500" /></div>
                                          <p className="text-lg font-black tracking-tight">{status.customer.phone || "No Phone Data"}</p>
                                       </div>
                                       <div className="flex items-center gap-4 text-zinc-700">
                                          <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center font-black"><Mail size={18} className="text-blue-500" /></div>
                                          <p className="text-base font-black truncate max-w-[220px] tracking-tight">{status.customer.email || "No Email Address"}</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Subscription Analytics Data */}
                              <div className="pt-10 border-t-2 border-black/5 flex items-center justify-between">
                                 <div className="space-y-2">
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] leading-none">Days Active</p>
                                    <p className={`text-4xl font-black tracking-tighter ${status.customer.days_left <= 3 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                       {status.customer.days_left} Days
                                    </p>
                                 </div>
                                 <div className="text-right space-y-2">
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] leading-none">Termination Date</p>
                                    <p className="text-xl font-black text-zinc-800 tracking-tight">{formatDate(status.customer.subscription_expiry)}</p>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="py-28 border-2 border-dashed border-zinc-200 rounded-[3.5rem] flex flex-col items-center justify-center text-zinc-300 group hover:bg-zinc-50 transition-all duration-500">
                              <ShieldCheck size={72} strokeWidth={0.75} className="group-hover:scale-110 group-hover:text-emerald-400 transition-all duration-700" />
                              <p className="text-base font-black uppercase tracking-[0.4em] mt-8 text-zinc-400">System Secure & Online</p>
                           </div>
                        )}
                    </Card>
                </div>

                {/* Section 2: Last Scans List Massive Card */}
                <div className="animate-in fade-in slide-in-from-bottom duration-700">
                    <Card title="Latest System Activity" className="p-8 xl:p-12 !bg-white shadow-2xl">
                        <div className="space-y-4">
                           {recentScans.length === 0 ? (
                              <div className="py-16 text-center text-zinc-300 text-sm font-black uppercase tracking-[0.3em]">Network Synchronized - No Logs</div>
                           ) : (
                              recentScans.slice(0, 3).map((scan) => (
                                 <div key={scan.id} className="flex items-center justify-between py-5 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/80 transition-all duration-300 px-5 rounded-[2rem] group cursor-default">
                                    <div className="flex items-center gap-6">
                                       <div className="relative">
                                            <div className="absolute -inset-1 bg-zinc-900/5 rounded-2xl blur group-hover:blur-md transition-all"></div>
                                            <img src={scan.photo_url} className="relative w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-lg" alt="" />
                                       </div>
                                       <div className="min-w-0 pr-6">
                                          <p className="text-xl font-black text-zinc-900 truncate tracking-tighter uppercase leading-none">{scan.name}</p>
                                          <div className="inline-flex items-center gap-3 mt-3 px-3 py-1 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                                             <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">{scan.session}</p>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="text-xs font-black text-zinc-400 flex items-center gap-3 uppercase flex-shrink-0 group-hover:text-zinc-900 transition-colors bg-zinc-50 px-4 py-2 rounded-2xl">
                                       <Clock size={14} className="text-zinc-300 group-hover:text-emerald-500" />
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