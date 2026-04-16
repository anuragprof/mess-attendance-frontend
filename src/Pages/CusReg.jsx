import { useState, useRef, useEffect } from "react";
import { Button } from "@/Pages/ui/button";
import { Input } from "@/Pages/ui/input";
import { Label } from "@/Pages/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Pages/ui/select";
import { toast } from "sonner";
import { registerCustomer } from "@/api/customer";
import api from "@/Lib/axios";
import { generateWhatsAppLink } from "@/Lib/whatsapp";
import {
  Camera, X, UserPlus, CreditCard, Banknote, Smartphone,
} from "lucide-react";

const CustomerRegistrationForm = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);

  const [planAmount, setPlanAmount] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");

  const [startMonth, setStartMonth] = useState("");
  const [startDay, setStartDay] = useState("");
  const [startYear, setStartYear] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    planId: "",
    photo: null,
  });

  const [whatsappLink, setWhatsappLink] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* ── Auto-set today's date ─────────────────────────── */
  useEffect(() => {
    const today = new Date();
    setStartDay(String(today.getDate()).padStart(2, "0"));
    setStartMonth(String(today.getMonth() + 1).padStart(2, "0"));
    setStartYear(today.getFullYear());
  }, []);

  /* ── Load plans ────────────────────────────────────── */
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await api.get("/plans/");
        setPlans(Array.isArray(res.data) ? res.data : (res.data?.items ?? []));
      } catch (err) {
        toast.error("Failed to load plans");
      }
    }
    fetchPlans();
  }, []);

  /* ── Camera ────────────────────────────────────────── */
  useEffect(() => {
    if (!cameraOpen || !videoRef.current) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      } catch (err) {
        console.error(err);
        toast.error("Unable to access camera");
      }
    };
    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [cameraOpen]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "customer.jpg", { type: "image/jpeg" });
      setFormData((prev) => ({ ...prev, photo: file }));
      setCameraOpen(false);
    }, "image/jpeg");
  };

  /* ── Submit ────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setWhatsappLink(null);
    setQrCode(null);
    setShowModal(false);

    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.planId || !formData.photo) {
      toast.error("Please fill all fields and capture photo");
      return;
    }
    if (!startMonth || !startDay || !startYear) {
      toast.error("Please enter start date");
      return;
    }

    const formattedStartDate = `${startYear}-${startMonth.padStart(2, "0")}-${startDay.padStart(2, "0")}`;

    try {
      setLoading(true);
      const data = new FormData();
      data.append("full_name", formData.fullName);
      data.append("phone_number", formData.phoneNumber);
      data.append("email", formData.email);
      data.append("plan_id", formData.planId);
      data.append("photo", formData.photo);
      data.append("start_date", formattedStartDate);
      data.append("total_amount", planAmount);
      data.append("total_amount_paid", amountPaid || 0);
      data.append("payment_mode", paymentMode);

      const res = await registerCustomer(data);
      toast.success("Customer registered successfully ✅");

      const phoneNumberSent = formData.phoneNumber;
      setFormData({ fullName: "", phoneNumber: "", email: "", planId: "", photo: null });
      setPlanAmount(0);
      setAmountPaid("");
      setPaymentMode("cash");
      setStartMonth("");
      setStartDay("");
      setStartYear("");

      setWhatsappLink(res.whatsapp_link || generateWhatsAppLink(phoneNumberSent));
      setQrCode(res.qr_code_url || res.qr_url);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.detail;
      if (errorMessage === "Customer already registered") {
        toast.error("Customer already registered ❌");
      } else {
        toast.error("Failed to register customer");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-indigo-50 rounded-xl">
            <UserPlus size={20} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">New Admission</h1>
            <p className="text-xs text-slate-400 font-medium">Register a new customer to your mess</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Personal Details Card ─────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Personal Details</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>WhatsApp Number</Label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Enter WhatsApp number"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Start Date (DD / MM / YYYY)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="DD"
                  maxLength={2}
                  value={startDay}
                  onChange={(e) => setStartDay(e.target.value)}
                  className="text-center"
                />
                <Input
                  placeholder="MM"
                  maxLength={2}
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="text-center"
                />
                <Input
                  placeholder="YYYY"
                  value={startYear}
                  readOnly
                  className="text-center bg-slate-50 text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Photo Card ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Customer Photo</h2>

          {!cameraOpen && !formData.photo && (
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              className="w-full flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer group"
            >
              <div className="p-3 rounded-full bg-white border border-slate-200 shadow-sm group-hover:border-indigo-300 group-hover:shadow-indigo-100 transition-all">
                <Camera size={24} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <span className="text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                Click to capture customer photo
              </span>
            </button>
          )}

          {cameraOpen && (
            <div className="space-y-3 rounded-xl border border-slate-200 p-4 bg-slate-50">
              <video
                ref={videoRef}
                muted
                className="w-full h-56 rounded-xl object-cover bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                <Button type="button" onClick={capturePhoto} className="flex-1" size="lg">
                  <Camera size={16} /> Capture
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCameraOpen(false)}
                  className="flex-1"
                  size="lg"
                >
                  <X size={16} /> Cancel
                </Button>
              </div>
            </div>
          )}

          {formData.photo && (
            <div className="flex items-center gap-4">
              <img
                src={URL.createObjectURL(formData.photo)}
                alt="Preview"
                className="h-20 w-20 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">Photo captured</p>
                <p className="text-xs text-slate-400 mt-0.5">Click below to retake</p>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, photo: null }));
                    setCameraOpen(true);
                  }}
                  className="text-xs font-semibold text-indigo-600 hover:underline mt-1"
                >
                  Retake Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Meal Plan Card ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Meal Plan</h2>

          <div className="space-y-1.5">
            <Label>Select Plan</Label>
            <Select
              value={formData.planId}
              onValueChange={(v) => {
                const selectedPlan = plans.find((p) => String(p.id) === v);
                setFormData({ ...formData, planId: v });
                if (selectedPlan) {
                  const basePrice = selectedPlan.price_cents || 0;
                  setPlanAmount(basePrice);
                  setAmountPaid(basePrice.toString());
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a meal plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={String(plan.id)}>
                    {plan.name} — ₹{plan.price_cents}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Payment Card ──────────────────────────────── */}
        {formData.planId && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <CreditCard size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Payment Collection
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Plan price: <span className="font-bold text-emerald-600">₹{planAmount}</span>
                </p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <Label>Amount Paid Today</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-600 text-base">₹</span>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="pl-9 h-12 text-lg font-bold text-slate-800 text-center"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Payment Method Toggle */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPaymentMode("cash")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    paymentMode === "cash"
                      ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Banknote size={14} />
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode("upi")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    paymentMode === "upi"
                      ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Smartphone size={14} />
                  UPI
                </button>
              </div>
            </div>

            {/* Balance Warning */}
            {parseFloat(amountPaid) < planAmount && (
              <div className="bg-rose-50 px-4 py-3 rounded-xl border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Unpaid Balance</p>
                  <p className="text-[10px] text-rose-400 mt-0.5">To be collected later</p>
                </div>
                <span className="text-lg font-black text-rose-600">
                  ₹{planAmount - (parseFloat(amountPaid) || 0)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-sm font-bold"
          size="lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Registering...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus size={16} />
              Register Customer
            </span>
          )}
        </Button>
      </form>

      {/* ── Success Modal ──────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-8 text-center space-y-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                <span className="text-2xl">✅</span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-800">Registration Success</h2>
                <p className="text-slate-400 text-sm mt-1">Customer registered successfully</p>
              </div>

              {qrCode && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 inline-block">
                  <img src={qrCode} alt="Customer QR" className="w-44 h-44 mx-auto rounded-lg" />
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="button"
                  disabled={!whatsappLink}
                  onClick={() => window.open(whatsappLink, "_blank")}
                  variant="success"
                  className="w-full h-12"
                  size="lg"
                >
                  Send WhatsApp Message
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="w-full h-12"
                  size="lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRegistrationForm;
