import { useState, useRef } from "react";
import ScanQR from "./ScanQR";
import api from "../Lib/axios";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const lastScanRef = useRef(null);
  const scanLockRef = useRef(false);

  if (!isOpen) return null;

  /* ================= VOICE FEEDBACK ================= */
  function speak(text) {
    if (!window.speechSynthesis) return;
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";
    msg.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  }

  async function handleScan(code) {
    if (!code || scanLockRef.current || code === lastScanRef.current) return;

    scanLockRef.current = true;
    lastScanRef.current = code;
    setLoading(true);
    setStatus(null);

    try {
      const res = await api.post("/scan/", { qr_value: code });
      const backendStatus = res.data.status;
      let type = "error";

      switch (backendStatus) {
        case "success":
          type = "success";
          speak("Successful");
          if (onScanSuccess) onScanSuccess();
          break;
        case "already_redeemed":
          type = "error";
          speak("Already redeemed");
          break;
        case "daily_limit_reached":
          type = "warning";
          speak("Daily limit reached");
          break;
        case "expired":
          type = "error";
          speak("Subscription expired");
          break;
        default:
          type = "error";
          speak("Invalid code");
      }

      setStatus({
        type,
        text: res.data.message,
        customer: res.data.customer,
      });
    } catch (e) {
      const errorMsg = e?.response?.data?.detail || "Scan failed";
      setStatus({ type: "error", text: errorMsg });
      speak("Scan failed");
      
      // Auto-logout if unauthorized (Audit requirement)
      if (e?.response?.status === 401 || e?.response?.status === 403) {
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        scanLockRef.current = false;
        lastScanRef.current = null; // Allow re-scanning same code after delay
      }, 3000);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h3 className="text-xl font-black text-zinc-900 tracking-tight">QR Scanner</h3>
            <p className="text-xs text-zinc-500 font-medium tracking-tight">Align QR code within the frame</p>
          </div>
          <button 
            onClick={() => {
                setStatus(null);
                onClose();
            }}
            className="p-2.5 bg-white border border-zinc-200 text-zinc-400 hover:text-zinc-600 rounded-2xl shadow-sm transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scanner Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="relative aspect-square max-w-[320px] mx-auto rounded-[2rem] overflow-hidden border-4 border-emerald-500 shadow-xl shadow-emerald-500/10">
             <ScanQR onDetected={handleScan} />
             {loading && (
               <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white p-4 rounded-3xl shadow-xl flex items-center gap-3 animate-in zoom-in-95 duration-200">
                     <Loader2 className="animate-spin text-blue-600" size={24} />
                     <span className="font-bold text-sm text-zinc-700">Verifying...</span>
                  </div>
               </div>
             )}
          </div>

          {/* Status Display */}
          {status && (
            <div className={`p-4 rounded-3xl border-2 animate-in slide-in-from-bottom-2 duration-300 ${
              status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' :
              status.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-900' : 
              'bg-rose-50 border-rose-100 text-rose-900'
            }`}>
              <div className="flex items-start gap-3">
                {status.type === 'success' ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} /> : <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />}
                <div>
                  <h4 className="font-black text-lg leading-tight mb-1">{status.text}</h4>
                  {status.customer && (
                    <p className="text-sm font-medium opacity-80">{status.customer.name} • CUST-{status.customer.id}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 text-center">
           <p className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400">Authenticated Operational Portal</p>
        </div>
      </div>
    </div>
  );
}
