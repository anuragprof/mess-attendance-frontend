
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

const CustomerRegistrationForm = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);

  const [planAmount, setPlanAmount] = useState(0);
  const [amountPaid, setAmountPaid] = useState("");

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
      data.append("total_amount", planAmount);
      data.append("total_amount_paid", amountPaid || 0);

      const res = await registerCustomer(data);

      toast.success("Customer registered successfully ✅");
      console.log("QR VALUE:", res.qr_value);

      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        planId: "",
        photo: null,
      });

      setPlanAmount(0);
      setAmountPaid("");

      setStartMonth("");
      setStartDay("");
      setStartYear("");

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
    <div className="mx-auto max-w-3xl rounded-2xl bg-card p-8 shadow-lg">
      <h2 className="mb-8 text-center text-2xl font-bold">
        Customer Registration
      </h2>

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
            <Label>Start Date</Label>
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
                setPlanAmount(selectedPlan.price_cents || 0);
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
          <div className="space-y-3 rounded-xl border p-4">
            <Label>Payment</Label>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Plan Amount</Label>
                <Input value={planAmount} disabled />
              </div>

              <div className="space-y-2">
                <Label>Amount Paid</Label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Leave blank if unpaid"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setAmountPaid(planAmount)}
              className="w-full"
            >
              Pay Full Amount
            </Button>
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
    </div>
  );
};

export default CustomerRegistrationForm;

