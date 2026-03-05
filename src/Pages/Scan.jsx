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
          type = "warning"
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
    <div className="grid md:grid-cols-2 gap-4">
      <ScanQR onDetected={handleScan} />

      <div className="space-y-4">

        {/* ================= CURRENT SCAN ================= */}
        <Card title="Recent Scan">
          {loading && (
            <div className="mt-4 text-blue-600 font-medium">
              Processing scan...
            </div>
          )}

          {status && (
            <div className={`mt-4 p-5 rounded-2xl border ${getStatusStyle()}`}>
              <div className="text-2xl font-semibold mb-4">
                {status.text}
              </div>

              {status.customer && (
                <div className="flex flex-col md:flex-row items-center gap-6">

                  {status.customer.photo_url && (
                    <img
                      src={status.customer.photo_url}
                      alt="Customer"
                      className="w-44 h-44 object-cover rounded-2xl border shadow-lg"
                    />
                  )}

                  <div className="space-y-3 text-lg">
                    <div>
                      <span className="font-semibold">Name:</span>{" "}
                      {status.customer.name}
                    </div>

                    <div>
                      <span className="font-semibold">Phone:</span>{" "}
                      {status.customer.phone}
                    </div>

                    <div>
                      <span className="font-semibold">Email:</span>{" "}
                      {status.customer.email}
                    </div>

                    {status.customer.subscription_expiry && (
                      <div>
                        <span className="font-semibold">
                          Subscription Expiry:
                        </span>{" "}
                        {formatDate(status.customer.subscription_expiry)}
                      </div>
                    )}

                    {typeof status.customer.days_left === "number" && (
                      <div>
                        <span className="font-semibold">Days Left:</span>{" "}
                        <span
                          className={
                            status.customer.days_left <= 0
                              ? "text-red-700 font-bold"
                              : status.customer.days_left <= 5
                              ? "text-red-600 font-semibold"
                              : "text-green-600 font-semibold"
                          }
                        >
                          {status.customer.days_left > 0
                            ? `${status.customer.days_left} days`
                            : "Expired"}
                        </span>
                      </div>
                    )}

                    {status.customer.days_left <= 0 && (
                      <div className="mt-2 text-red-700 font-bold text-lg">
                        Subscription Expired
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ================= LAST 3 SCANS ================= */}
        <Card title="Last 3 Scans">
          {recentScans.length === 0 ? (
            <div className="text-zinc-500 text-sm">
              No recent scans
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center gap-4 p-3 border rounded-xl bg-zinc-50"
                >
                  {scan.photo_url && (
                    <img
                      src={scan.photo_url}
                      alt="customer"
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  )}

                  <div>
                    <div className="font-medium">
                      {scan.name}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {scan.session} •{" "}
                      {new Date(scan.date).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}