import { useState, useRef, useEffect } from "react"
import ScanQR from "../Components/ScanQR"
import Card from "../Components/Card"
import api from "../Lib/axios"
import { Clock, Users, Utensils, Phone, Mail, Calendar, Hash, ArrowRight } from "lucide-react"

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

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="h-screen flex flex-col p-4 md:-m-4 md:p-8 bg-zinc-50 overflow-hidden">
      
      {/* Page Header (Fixed Height) */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6">
         <div className="space-y-1">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Attendance Scanner</h1>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Live Meal Redemption System
            </p>
         </div>
      </div>

      {/* Main Grid Area - Viewport Constrained */}
      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        
        {/* LEFT COLUMN: SCANNER - Fluid width */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
           <Card title="Scan Student QR">
              <div className="h-full flex flex-col overflow-hidden">
                 <div className="flex-1 flex items-center justify-center p-2 min-h-0">
                    <div className="relative w-full max-w-[450px] aspect-square rounded-[2rem] overflow-hidden border-8 border-zinc-50 shadow-inner bg-zinc-100">
                       <ScanQR onDetected={handleScan} />
                    </div>
                 </div>
                 
                 <div className="flex-shrink-0 mt-4 p-5 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200 text-center">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-2 text-zinc-400">
                       <Hash size={18} />
                    </div>
                    <p className="text-xs font-black text-zinc-800 tracking-tight">Focus your camera on the QR Code</p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">Real-time detection</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* RIGHT COLUMN: DETAILS & HISTORY - Fixed width Desktop, Scrollable */}
        <div className="w-full lg:w-[500px] flex flex-col min-h-0 overflow-hidden">
           
           <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 custom-scrollbar">
              {/* SECTION 1: Recent Scan Result */}
              <div className="flex-shrink-0 animate-in fade-in slide-in-from-right duration-500">
                 <Card title="Recent Scan Output">
                    {loading ? (
                       <div className="py-20 flex flex-col items-center justify-center gap-4">
                          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                          <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Verifying Identity...</p>
                       </div>
                    ) : status?.customer ? (
                       <div className="p-1 space-y-6">
                          {/* Result Message Banner */}
                          <div className={`p-5 rounded-3xl border-2 flex items-center justify-between gap-4 ${getStatusStyle()}`}>
                             <div className="flex-1">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5 whitespace-nowrap">Scan Status</p>
                                <h4 className="text-lg font-black tracking-tight">{status.text}</h4>
                             </div>
                             <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-white shadow-sm font-bold text-lg`}>
                                {status.type === "success" ? "✅" : status.type === "warning" ? "⚠️" : "❌"}
                             </div>
                          </div>

                          {/* Identity Details */}
                          <div className="flex gap-6 items-start">
                             <div className="flex-shrink-0">
                                <img 
                                   src={status.customer.photo_url} 
                                   className="w-32 h-32 rounded-[2rem] object-cover border-4 border-white shadow-2xl" 
                                   alt={status.customer.name} 
                                />
                             </div>

                             <div className="flex-1 space-y-4 pt-1">
                                <div>
                                   <h3 className="text-2xl font-black text-zinc-900 leading-none truncate max-w-[200px]">{status.customer.name}</h3>
                                   <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-zinc-900 text-white rounded-full">
                                      <span className="text-[9px] font-black tracking-widest">CUST-{status.customer.id}</span>
                                   </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                   <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><Phone size={14} /></div>
                                      <p className="text-sm font-black text-zinc-800">{status.customer.phone || "—"}</p>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Mail size={14} /></div>
                                      <p className="text-xs font-black text-zinc-800 truncate max-w-[150px]">{status.customer.email || "—"}</p>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Expiry</p>
                                <p className="text-sm font-black text-zinc-800">{formatDate(status.customer.subscription_expiry)}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Remaining</p>
                                <p className={`text-xl font-black ${status.customer.days_left <= 3 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                   {status.customer.days_left} Days
                                </p>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="py-24 border-2 border-dashed border-zinc-100 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-300">
                          <Users size={32} />
                          <p className="text-xs font-black uppercase tracking-[0.2em] mt-3">Awaiting Scan</p>
                       </div>
                    )}
                 </Card>
              </div>

              {/* SECTION 2: Last 3 Scans History */}
              <div className="flex-shrink-0 animate-in fade-in slide-in-from-bottom duration-700">
                 <Card title="Last 3 Scans">
                    <div className="p-1 space-y-3">
                       {recentScans.length === 0 ? (
                          <div className="py-10 text-center text-zinc-300 italic text-sm">No recent activity</div>
                       ) : (
                          recentScans.slice(0, 3).map((scan) => (
                             <div key={scan.id} className="flex items-center gap-4 p-3 bg-zinc-50/50 rounded-2xl border border-zinc-100 group transition-all duration-300">
                                <img src={scan.photo_url} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" alt="" />
                                <div className="flex-1 min-w-0">
                                   <p className="text-sm font-black text-zinc-900 truncate tracking-tight">{scan.name}</p>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">{scan.session}</span>
                                      <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1 uppercase">
                                         <Clock size={8} /> {new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                   </div>
                                </div>
                                <ArrowRight size={14} className="text-zinc-200" />
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