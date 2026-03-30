import { useState, useRef, useEffect } from "react"
import { Users, Clock, Utensils } from "lucide-react"
import ScanQR from "../Components/ScanQR"
import Card from "../Components/Card"
import api from "../Lib/axios"

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
      return "bg-green-50 border-green-300 text-green-800"
    if (status.type === "warning")
      return "bg-yellow-50 border-yellow-300 text-yellow-800"
    return "bg-red-50 border-red-300 text-red-600"
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
    <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden -m-4">
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row gap-4 p-4">
        
        {/* LEFT: Scanner Section */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-zinc-100 shadow-sm overflow-hidden relative">
           <ScanQR onDetected={handleScan} />
           
           {/* Success/Error Floating Notification */}
           {status && (
             <div className={`absolute bottom-8 left-8 right-8 p-5 rounded-3xl border-4 shadow-2xl animate-in slide-in-from-bottom duration-500 ${getStatusStyle()}`}>
                <div className="flex items-center gap-5">
                   <div className="flex-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">Scanned Message</p>
                     <p className="text-xl font-black tracking-tight leading-tight">{status.text}</p>
                   </div>
                   {status.customer?.photo_url && (
                     <img src={status.customer.photo_url} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
                   )}
                </div>
             </div>
           )}
        </div>

        {/* RIGHT: Status & History Section */}
        <div className="w-full lg:w-[420px] flex flex-col gap-4 min-h-0">
           
           {/* Active Result Card */}
           <div className="flex-shrink-0">
              <Card title="Current Identity">
                 {loading ? (
                    <div className="py-10 flex flex-col items-center gap-4 text-emerald-600">
                       <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                       <p className="text-xs font-black uppercase tracking-widest">Validating Ticket...</p>
                    </div>
                 ) : status?.customer ? (
                    <div className="flex items-start gap-5">
                       <img src={status.customer.photo_url} className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl" alt="" />
                       <div className="space-y-1.5 pt-1">
                          <p className="text-2xl font-black text-zinc-900 leading-none">{status.customer.name}</p>
                          <div className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full inline-block">CUST-{status.customer.id}</div>
                          
                          <div className="pt-2">
                             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Subscription</p>
                             <div className="flex items-baseline gap-2">
                                <span className={`text-sm font-black ${status.customer.days_left <= 0 ? 'text-rose-600' : 'text-zinc-800'}`}>
                                   {status.customer.days_left} Days
                                </span>
                                <span className="text-[10px] font-medium text-zinc-400 italic">Exp: {formatDate(status.customer.subscription_expiry)}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="py-12 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center text-zinc-300">
                       <div className="p-3 bg-zinc-50 rounded-2xl mb-2"><Users size={24} /></div>
                       <p className="text-xs font-bold uppercase tracking-widest">Awaiting Identity Scan</p>
                    </div>
                 )}
              </Card>
           </div>

           {/* Recent Scans Scrollable Log */}
           <div className="flex-1 min-h-0 bg-white rounded-[2rem] border-2 border-zinc-100 shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                   <Clock size={14} className="text-emerald-500" />
                   Recent Activity
                 </h3>
                 <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                 {recentScans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                       <Utensils size={40} />
                       <p className="text-[10px] font-black uppercase tracking-widest mt-2">Log is Empty</p>
                    </div>
                 ) : (
                    recentScans.map((scan) => (
                       <div key={scan.id} className="flex items-center gap-4 group transition-all">
                          <div className="relative">
                             <img src={scan.photo_url} className="w-12 h-12 rounded-2xl object-cover border shadow-sm group-hover:scale-105 transition" alt="" />
                             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                             </div>
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="text-sm font-black text-zinc-800 truncate tracking-tight">{scan.name}</p>
                             <p className="text-[10px] font-bold text-zinc-400 uppercase">
                                {scan.session} • {new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}