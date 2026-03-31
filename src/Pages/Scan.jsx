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
    <div className="h-screen flex flex-col p-6 md:-m-4 md:p-8 bg-zinc-100 overflow-hidden">
      
      {/* 🏷 Heading: Pixel Perfect Copy */}
      <div className="flex-shrink-0 mb-8">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
                Attendance Scanner
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                <span className="text-zinc-400 font-bold text-sm uppercase tracking-[0.25em]">Live Meal Redemption System</span>
            </h1>
      </div>

      <div className="flex-1 grid lg:grid-cols-12 gap-10 overflow-hidden">
        
        {/* 📷 LEFT: LARGE QR SCANNER SECTION (≈65%) */}
        <div className="lg:col-span-8 flex flex-col min-h-0 overflow-hidden">
            <ScanQR onDetected={handleScan} />
        </div>

        {/* 📋 RIGHT: TWO STACKED CARDS (≈35%) */}
        <div className="lg:col-span-4 flex flex-col min-h-0 gap-8 overflow-hidden">
           
           <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-8 custom-scrollbar">
              
              {/* Card 1: Recent Scan Output */}
              <div className="flex-shrink-0 animate-in fade-in slide-in-from-right duration-500">
                 <Card title="Recent Scan Output" className={getCardStatusStyle()}>
                    {loading ? (
                       <div className="py-20 flex flex-col items-center justify-center gap-4">
                          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Verifying Ticket...</p>
                       </div>
                    ) : status?.customer ? (
                       <div className="space-y-6">
                          {/* Top Status Message Banner */}
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm ${status.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {status.type === "success" ? "✓" : "✕"}
                             </div>
                             <h4 className="text-lg font-black tracking-tight text-zinc-900">{status.text}</h4>
                          </div>

                          {/* Identity Card Details */}
                          <div className="flex gap-5 items-start">
                             <img 
                                src={status.customer.photo_url} 
                                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" 
                                alt="" 
                             />
                             <div className="flex-1 space-y-3 pt-1">
                                <div>
                                   <h3 className="text-xl font-black text-zinc-900 leading-none">{status.customer.name}</h3>
                                   <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-widest">CUST-{status.customer.id}</p>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5"><Phone size={10} /> {status.customer.phone || "—"}</p>
                                   <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5"><Mail size={10} /> {status.customer.email || "—"}</p>
                                </div>
                             </div>
                          </div>

                          {/* Expiry Bar */}
                          <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                             <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Expiry Date</p>
                                <p className="text-xs font-black text-zinc-800">{formatDate(status.customer.subscription_expiry)}</p>
                             </div>
                             <div className="text-right space-y-0.5">
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Remaining</p>
                                <p className={`text-sm font-black ${status.customer.days_left <= 3 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                   {status.customer.days_left} Days
                                </p>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="py-20 border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-zinc-300">
                          <ShieldCheck size={32} strokeWidth={1.5} />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-3">Identity Pending</p>
                       </div>
                    )}
                 </Card>
              </div>

              {/* Card 2: Last Scans List */}
              <div className="flex-shrink-0 animate-in fade-in slide-in-from-bottom duration-700">
                 <Card title="Last Scans" className="!bg-white">
                    <div className="space-y-1.5">
                       {recentScans.length === 0 ? (
                          <div className="py-10 text-center text-zinc-300 text-[10px] uppercase font-bold tracking-widest italic">No records found</div>
                       ) : (
                          recentScans.map((scan) => (
                             <div key={scan.id} className="flex items-center gap-4 p-3 hover:bg-zinc-50 rounded-2xl transition-colors group">
                                <img src={scan.photo_url} className="w-10 h-10 rounded-xl object-cover border border-zinc-100 shadow-sm" alt="" />
                                <div className="flex-1 min-w-0">
                                   <p className="text-sm font-black text-zinc-900 truncate tracking-tight uppercase">{scan.name}</p>
                                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{scan.session}</p>
                                </div>
                                <div className="text-[10px] font-black text-zinc-300 uppercase group-hover:text-zinc-900 transition-colors">
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