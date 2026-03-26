import { useEffect, useRef, useState } from "react";
import api from "@/Lib/axios";
import { Input } from "@/Pages/ui/input";
import { Label } from "@/Pages/ui/label";
import { Search, X } from "lucide-react";

export default function CustomerSearch({ selectedCustomer, setSelectedCustomer, onHistoryClick }) {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!debouncedQuery) return;
      try {
        const res = await api.get(`/customers/search?q=${debouncedQuery}`);
        setCustomers(res.data);
      } catch (err) {
        console.error("Search failed:", err);
      }
    };
    fetchCustomers();
  }, [debouncedQuery]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSearchQuery("");
    setCustomers([]);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setSearchQuery("");
    setCustomers([]);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-zinc-700">Select Customer *</Label>

      {selectedCustomer ? (
        <div className="flex justify-between items-center border border-black/15 p-4 rounded-2xl bg-white shadow-sm transition-all hover:border-black/30 hover:shadow-md animate-in slide-in-from-top-1">
          <div className="flex items-center gap-4">
            <img
              src={selectedCustomer.photo_url || "/avatar.png"}
              className="w-12 h-12 rounded-full object-cover border-2 border-zinc-50"
              alt={selectedCustomer.full_name}
            />
            <div>
              <p className="font-bold text-zinc-900">{selectedCustomer.full_name}</p>
              <p className="text-xs font-mono text-zinc-500 uppercase tracking-tighter">
                {selectedCustomer.phone_number}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {onHistoryClick && (
              <button
                className="text-xs font-bold bg-zinc-50 border border-black/10 rounded-xl px-4 py-2 hover:bg-zinc-100 hover:border-black/30 transition-all"
                onClick={onHistoryClick}
              >
                Payment History
              </button>
            )}
            <button 
                onClick={handleClearCustomer}
                className="p-2 hover:bg-zinc-50 rounded-full text-zinc-400 hover:text-rose-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <Input
            className="pl-11 h-12 rounded-2xl border-black/15 bg-white/50 focus:bg-white focus:border-black focus:ring-0 transition-all font-medium placeholder:text-zinc-400"
            placeholder="Search by name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          {customers.length > 0 && (
            <div className="absolute w-full bg-white border border-black/15 rounded-2xl mt-2 z-50 shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onMouseDown={() => handleSelectCustomer(c)}
                  className="flex items-center gap-4 w-full text-left px-4 py-3 hover:bg-zinc-50 group/item transition-colors border-b border-black/[0.03] last:border-none"
                >
                  <img
                    src={c.photo_url || "/avatar.png"}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-50 shadow-sm"
                    alt={c.full_name}
                  />
                  <div>
                    <p className="text-sm font-bold text-zinc-900 group-hover/item:text-blue-600 transition-colors">{c.full_name}</p>
                    <p className="text-xs font-mono text-zinc-400 font-medium">#{c.id} • {c.phone_number}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
