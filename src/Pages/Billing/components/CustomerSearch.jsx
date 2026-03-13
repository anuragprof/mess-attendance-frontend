import { useEffect, useRef, useState } from "react";
import axios from "@/Lib/axios";
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
      const res = await axios.get(`/customers/search?q=${debouncedQuery}`);
      setCustomers(res.data);
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
    <div className="space-y-2">
      <Label>Customer *</Label>

      {selectedCustomer ? (
        <div className="flex justify-between items-center border p-3 rounded-lg bg-white">
          <div className="flex items-center gap-3">
            <img
              src={selectedCustomer.photo_url || "/avatar.png"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{selectedCustomer.full_name}</p>
              <p className="text-xs text-gray-500">{selectedCustomer.phone_number}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {onHistoryClick && (
              <button
                className="text-sm border rounded px-3 py-1 hover:bg-gray-50"
                onClick={onHistoryClick}
              >
                History
              </button>
            )}
            <button onClick={handleClearCustomer}>
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9 h-11"
            placeholder="Search customer..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          {customers.length > 0 && (
            <div className="absolute w-full bg-white border rounded mt-1 z-10 max-h-60 overflow-y-auto">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onMouseDown={() => handleSelectCustomer(c)}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 hover:bg-gray-100"
                >
                  <img
                    src={c.photo_url || "/avatar.png"}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{c.full_name}</p>
                    <p className="text-xs text-gray-500">{c.phone_number}</p>
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
