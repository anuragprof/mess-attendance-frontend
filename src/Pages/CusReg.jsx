
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

const CustomerRegistrationForm = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);

  const [planAmount, setPlanAmount] = useState(0);
  const [rate, setRate] = useState("");

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

  /* ---------------- AUTO SET TODAY DATE ---------------- */

  useEffect(() => {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    setStartDay(day);
    setStartMonth(month);
    setStartYear(year);
  }, []);

  /* ---------------- LOAD PLANS ---------------- */

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await api.get("/plans/");
        setPlans(res.data);
      } catch (err) {
        toast.error("Failed to load plans");
      }
    }

    fetchPlans();
  }, []);

  /* ---------------- CAMERA START ---------------- */

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
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraOpen]);

  /* ---------------- CAPTURE PHOTO ---------------- */

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], "customer.jpg", {
        type: "image/jpeg",
      });

      setFormData((prev) => ({ ...prev, photo: file }));
      setCameraOpen(false);
    }, "image/jpeg");
  };

  /* ---------------- FORM SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWhatsappLink(null);
    setQrCode(null);
    setShowModal(false);

    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.planId ||
      !formData.photo
    ) {
      toast.error("Please fill all fields and capture photo");
      return;
    }

    if (!startMonth || !startDay || !startYear) {
      toast.error("Please enter start date");
      return;
    }

    const formattedStartDate = `${startYear}-${startMonth.padStart(
      2,
      "0"
    )}-${startDay.padStart(2, "0")}`;

    try {
      setLoading(true);

      const data = new FormData();
      data.append("full_name", formData.fullName);
      data.append("phone_number", formData.phoneNumber);
      data.append("email", formData.email);
      data.append("plan_id", formData.planId);
      data.append("photo", formData.photo);

      data.append("start_date", formattedStartDate);
      data.append("total_amount", rate);
      data.append("total_amount_paid", rate);

      const res = await registerCustomer(data);

      toast.success("Customer registered successfully ✅");
      console.log("QR VALUE:", res.qr_value);

      const phoneNumberSent = formData.phoneNumber;
      
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        planId: "",
        photo: null,
      });

      setPlanAmount(0);
      setRate("");

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
    <div className="mx-auto max-w-3xl gradient-card p-8">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name + Phone */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              placeholder="Enter WhatsApp number"
            />
          </div>
        </div>

        {/* Email + Start Date */}
        <div className="grid gap-6 md:grid-cols-2">

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-2">
            <Label>Start Date dd/mm/yyyy</Label>
            <div className="flex gap-2">

              <Input
                placeholder="DD"
                maxLength={2}
                value={startDay}
                onChange={(e) => setStartDay(e.target.value)}
              />

              <Input
                placeholder="MM"
                maxLength={2}
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
              />

              <Input
                placeholder="YYYY"
                value={startYear}
                readOnly
                className="bg-muted"
              />

            </div>
          </div>

        </div>

        {/* Camera */}
        <div className="space-y-3">
          <Label>Customer Photo</Label>

          {!cameraOpen && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCameraOpen(true)}
              className="w-full"
            >
              📸 Click Customer Photo
            </Button>
          )}

          {cameraOpen && (
            <div className="space-y-3 rounded-xl border p-4">
              <video
                ref={videoRef}
                muted
                className="w-full h-64 rounded-lg object-cover bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                <Button type="button" onClick={capturePhoto} className="flex-1">
                  Capture
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setCameraOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {formData.photo && (
            <div className="flex justify-center pt-2">
              <img
                src={URL.createObjectURL(formData.photo)}
                alt="Preview"
                className="h-32 w-32 rounded-xl object-cover border shadow"
              />
            </div>
          )}
        </div>

        {/* Meal Plan */}
        <div className="space-y-2">
          <Label>Meal Plan</Label>
          <Select
            value={formData.planId}
            onValueChange={(v) => {
              const selectedPlan = plans.find((p) => String(p.id) === v);

              setFormData({ ...formData, planId: v });

              if (selectedPlan) {
                const basePrice = selectedPlan.price_cents || 0;
                setPlanAmount(basePrice);
                setRate(basePrice.toString());
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={String(plan.id)}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment */}
        {formData.planId && (
          <div className="space-y-4 rounded-3xl border-2 border-emerald-100 bg-emerald-50/50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-700">
                💰
              </div>
              <Label className="text-sm font-black uppercase tracking-widest text-emerald-900">Pricing & Rate</Label>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-600 uppercase">Standard Plan Price</p>
                <div className="text-2xl font-black text-emerald-950/30">₹{planAmount}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-emerald-700 uppercase">Negotiated Monthly Rate</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-600">₹</span>
                  <Input
                    type="number"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="pl-8 h-12 rounded-2xl border-2 border-emerald-200 focus:ring-emerald-500 font-bold bg-white"
                    placeholder="Enter rate"
                    required
                    min="1"
                  />
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-emerald-600 font-medium italic">
              * By default, the rate is set to the plan price. You can adjust it for this specific customer.
            </p>
          </div>
        )}

         <Button
           type="submit"
           disabled={loading}
           className="w-full py-6 text-lg font-semibold"
         >
           {loading ? "Registering..." : "Register Customer"}
         </Button>
       </form>
 
       {/* SUCCESS MODAL */}
       {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-300">
             <div className="p-8 text-center space-y-6">
               <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                 <span className="text-3xl">✅</span>
               </div>
               
               <div>
                 <h2 className="text-2xl font-bold text-zinc-800">Registration Success</h2>
                 <p className="text-zinc-500 text-sm mt-1">Customer has been registered successfully</p>
               </div>
 
               {qrCode && (
                 <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 inline-block shadow-inner">
                   <img 
                     src={qrCode} 
                     alt="Customer QR" 
                     className="w-48 h-48 mx-auto rounded-xl"
                   />
                 </div>
               )}
 
               <div className="space-y-3">
                 <Button
                   type="button"
                   disabled={!whatsappLink}
                   onClick={() => {
                     console.log("WhatsApp Link:", whatsappLink);
                     window.open(whatsappLink, "_blank");
                   }}
                   className="w-full py-6 bg-green-600 hover:bg-green-700 text-white font-bold"
                 >
                   Send WhatsApp Message
                 </Button>
 
                 <Button
                   type="button"
                   variant="outline"
                   onClick={() => setShowModal(false)}
                   className="w-full py-6 text-zinc-600 font-bold border-zinc-200"
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

