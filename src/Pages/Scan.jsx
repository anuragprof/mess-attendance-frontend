import { useState, useRef, useEffect } from "react"
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
    if (!status) return "";
    if (status.type === "success")
      return "bg-green-50 border-green-300 text-green-800";
    if (status.type === "warning")
      return "bg-yellow-50 border-yellow-300 text-yellow-800";
    return "bg-red-50 border-red-300 text-red-600";
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="grid md:grid-cols-2 gap-8 items-start relative">
        <div className="relative group overflow-hidden rounded-[2.5rem] bg-black border-[10px] border-zinc-900 shadow-2xl aspect-square flex items-center justify-center">
            <ScanQR onDetected={handleScan} />
            
            {/* The "Popup" floating notification user likes */}
            {status && (
              <div className={`absolute bottom-6 left-6 right-6 p-5 rounded-3xl border-4 shadow-2xl animate-in slide-in-from-bottom duration-500 z-10 ${getStatusStyle()}`}>
                 <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">Scan Status</p>
                      <p className="text-lg font-black tracking-tight leading-tight">{status.text}</p>
                    </div>
                    {status.customer?.photo_url && (
                      <img src={status.customer.photo_url} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" alt="" />
                    )}
                 </div>
              </div>
            )}
        </div>

        <div className="space-y-6">
          {/* ================= CURRENT IDENTITY ================= */}
          <Card title="Current Identity">
            {loading ? (
              <div className="py-10 flex flex-col items-center gap-4 text-emerald-600">
                 <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                 <p className="text-xs font-black uppercase tracking-widest">Identifying...</p>
              </div>
            ) : status?.customer ? (
              <div className="flex flex-col md:flex-row items-center gap-6">
                {status.customer.photo_url && (
                  <img
                    src={status.customer.photo_url}
                    alt="Customer"
                    className="w-32 h-32 object-cover rounded-3xl border-4 border-white shadow-xl"
                  />
                )}

                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-start">
                     <div>
                       <h2 className="text-2xl font-black text-zinc-900 leading-none">{status.customer.name}</h2>
                       <div className="mt-1 bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full inline-block">CUST-{status.customer.id}</div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Days Left</p>
                      <p className={`text-lg font-black ${status.customer.days_left <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                         {status.customer.days_left > 0 ? status.customer.days_left : "Expired"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Expires On</p>
                      <p className="text-xs font-black text-zinc-800">{formatDate(status.customer.subscription_expiry)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 border-2 border-dashed border-zinc-100 rounded-3xl flex flex-col items-center justify-center text-zinc-300">
                 <p className="text-xs font-bold uppercase tracking-widest">Awaiting Scan</p>
              </div>
            )}
          </Card>

          {/* ================= LAST 3 SCANS ================= */}
          <Card title="Recent History">
            {recentScans.length === 0 ? (
              <div className="text-zinc-500 text-sm italic py-4">No recent activity</div>
            ) : (
              <div className="space-y-3">
                {recentScans.slice(0, 3).map((scan) => (
                  <div key={scan.id} className="flex items-center gap-4 p-3 border rounded-2xl bg-zinc-50/50">
                    <img
                      src={scan.photo_url}
                      alt="customer"
                      className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-zinc-800 truncate">{scan.name}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">
                        {scan.session} • {new Date(scan.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}