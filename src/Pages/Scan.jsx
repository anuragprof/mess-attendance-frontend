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
    <div className="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-2">
         <div className="space-y-1">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Attendance Scanner</h1>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Live Meal Redemption System
            </p>
         </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 flex-1">
        
        {/* LEFT COLUMN: SCANNER - 5/12 slots */}
        <div className="lg:col-span-5 space-y-6">
           <Card title="Scan Student QR">
              <div className="p-2">
                 <div className="relative aspect-square rounded-[2rem] overflow-hidden border-8 border-zinc-50 shadow-inner bg-zinc-100">
                    <ScanQR onDetected={handleScan} />
                 </div>
                 
                 <div className="mt-8 p-6 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200 text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                       <Hash size={20} />
                    </div>
                    <p className="text-sm font-black text-zinc-800">Position the QR Code within the frame</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">Automatic detection enabled</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* RIGHT COLUMN: DETAILS & HISTORY - 7/12 slots */}
        <div className="lg:col-span-7 flex flex-col gap-6 min-w-0">
           
           {/* SECTION 1: Recent Scan Result */}
           <div className="animate-in fade-in slide-in-from-right duration-500">
              <Card title="Recent Scan Output">
                 {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                       <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                       <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Verifying Identity...</p>
                    </div>
                 ) : status?.customer ? (
                    <div className="p-2 space-y-6">
                       {/* Result Message Banner */}
                       <div className={`p-5 rounded-3xl border-2 flex items-center justify-between gap-4 ${getStatusStyle()}`}>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5 whitespace-nowrap">Scan Status</p>
                             <h4 className="text-xl font-black tracking-tight">{status.text}</h4>
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm font-bold text-lg`}>
                             {status.type === "success" ? "✅" : status.type === "warning" ? "⚠️" : "❌"}
                          </div>
                       </div>

                       {/* User Identity Details */}
                       <div className="flex flex-col md:flex-row gap-8 items-start">
                          <div className="relative group">
                             <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-[2.5rem] blur opacity-15 group-hover:opacity-25 transition duration-500"></div>
                             <img 
                                src={status.customer.photo_url} 
                                className="relative w-40 h-40 rounded-[2rem] object-cover border-4 border-white shadow-2xl" 
                                alt={status.customer.name} 
                             />
                          </div>

                          <div className="flex-1 space-y-5 py-1">
                             <div>
                                <h3 className="text-3xl font-black text-zinc-900 leading-none">{status.customer.name}</h3>
                                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full">
                                   <Hash size={12} className="text-zinc-400" />
                                   <span className="text-xs font-black tracking-widest">CUST-{status.customer.id}</span>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                      <Phone size={10} className="text-emerald-500" /> Phone
                                   </p>
                                   <p className="text-sm font-black text-zinc-800">{status.customer.phone || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                      <Mail size={10} className="text-blue-500" /> Email
                                   </p>
                                   <p className="text-sm font-black text-zinc-800 truncate max-w-[150px]">{status.customer.email || "—"}</p>
                                </div>
                             </div>

                             <div className="pt-4 border-t border-zinc-100 grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                      <Calendar size={10} className="text-rose-500" /> Plan Expiry
                                   </p>
                                   <p className="text-sm font-black text-zinc-800">{formatDate(status.customer.subscription_expiry)}</p>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Days Remaining</p>
                                   <p className={`text-xl font-black ${status.customer.days_left <= 3 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                      {status.customer.days_left} Days
                                   </p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="py-24 border-2 border-dashed border-zinc-100 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-300">
                       <div className="w-16 h-16 bg-zinc-50 rounded-[2rem] mb-4 flex items-center justify-center shadow-inner">
                          <Users size={32} />
                       </div>
                       <p className="text-sm font-black uppercase tracking-[0.2em]">Awaiting Identity Scan</p>
                       <p className="text-[10px] font-bold text-zinc-400 mt-2">Latest student details will appear here</p>
                    </div>
                 )}
              </Card>
           </div>

           {/* SECTION 2: Last 3 Scans History */}
           <div className="animate-in fade-in slide-in-from-bottom duration-700">
              <Card title="Last 3 Scans">
                 <div className="p-2 space-y-3">
                    {recentScans.length === 0 ? (
                       <div className="py-10 text-center text-zinc-300 italic text-sm">No recent activity</div>
                    ) : (
                       recentScans.slice(0, 3).map((scan) => (
                          <div key={scan.id} className="flex items-center gap-5 p-4 bg-zinc-50/50 rounded-3xl border border-zinc-100 group hover:bg-white hover:shadow-md transition-all duration-300">
                             <img src={scan.photo_url} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" alt="" />
                             <div className="flex-1">
                                <p className="text-base font-black text-zinc-900 tracking-tight">{scan.name}</p>
                                <div className="flex items-center gap-3 mt-0.5">
                                   <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">{scan.session}</span>
                                   <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                                      <Clock size={10} /> {new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                </div>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-200 group-hover:text-emerald-500 transition-colors">
                                <ArrowRight size={16} />
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
  )
}