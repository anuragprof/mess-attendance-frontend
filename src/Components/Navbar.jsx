import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutVendor } from "../features/auth/api";

const Tab = ({ to, children }) => {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl transition border ${
        active
          ? "bg-emerald-600 text-white border-emerald-600"
          : "bg-white/80 border-zinc-200 hover:bg-zinc-50"
      }`}
    >
      {children}
    </Link>
  );
};

export default function Navbar({ me, setMe }) {
  const navigate = useNavigate();

  console.log(me);

  const handleLogout = async () => {
    try {
      await logoutVendor();   // 🔥 Backend logout (clears cookies)
      setMe(null);            // 🔥 Clear frontend state
      navigate("/login");     // 🔥 Redirect to login
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-zinc-200">
      <div className="mx-auto max-w-6xl p-3 flex items-center justify-between">
        
        {/* Left Side - App Name */}
        <div className="font-semibold">Happy Foods</div>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Vendor Name */}
          {me && (
            <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1 rounded-full">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-semibold">
                {me.name?.[0]}
              </div>
              <span className="text-sm text-zinc-700">{me.name}</span>
            </div>
          )}

          <nav className="flex gap-2">
            <Tab to="/scan">Scan</Tab>
            <Tab to="/register">Register</Tab>
            <Tab to="/admin">Admin</Tab>

            {!me ? (
              <Tab to="/login">Login</Tab>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
