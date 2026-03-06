// src/features/auth/LoginForm.jsx
import { useState } from "react";
import { loginVendor, getVendorMe } from "./api";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ setMe }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErr(""); // clear immediately

    try {
      await loginVendor({ email, password });
      const data = await getVendorMe();

      setErr("");        // ✅ clear again just to be safe
      setMe(data);
      navigate("/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }


  return (



  <div className="min-h-screen w-full flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/login-bg.jpg')" }} >

    <div className="max-w-md w-full p-6 rounded-xl border border-white/30 bg-white/65 backdrop-blur-md shadow-2xl">
      <h2 className="text-xl font-semibold mb-4 text-center">Mess Login</h2>

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10, cursor: "pointer" }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {err && <p style={{ color: "tomato", marginTop: 12 }}>{err}</p>}
      </form>
    </div>
  </div>
  );
}
