import { useEffect, useState } from "react";
import Card from "../Components/Card";
import { toast } from "sonner";
import axios from "@/lib/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Pages/ui/select";

export default function Admin() {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [renewCustomer, setRenewCustomer] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [previewCustomer, setPreviewCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
    fetchPlans();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/customers/", {
        withCredentials: true,
      });
      setCustomers(res.data);
    } catch {
      toast.error("Failed to load customers");
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await axios.get("/plans/", {
        withCredentials: true,
      });
      setPlans(res.data);
    } catch {
      toast.error("Failed to load plans");
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`/customers/${id}`, {
        withCredentials: true,
      });
      toast.success("Customer deleted");
      fetchCustomers();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleUpdate = async () => {
    const data = new FormData();
    data.append("full_name", editingCustomer.full_name);
    data.append("phone_number", editingCustomer.phone_number);
    data.append("email", editingCustomer.email);
    data.append("plan_id", editingCustomer.plan_id);

    await axios.put(`/customers/${editingCustomer.id}`, data, {
      withCredentials: true,
    });

    toast.success("Customer updated");
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleRenew = async () => {
    const data = new FormData();
    data.append("plan_id", renewCustomer.plan_id);

    await axios.post(
      `/customers/${renewCustomer.id}/renew`,
      data,
      { withCredentials: true }
    );

    toast.success("Plan renewed");
    setRenewCustomer(null);
    fetchCustomers();
  };

  const filteredCustomers = customers.filter((c) => {
    const query = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      String(c.id).includes(query) ||
      `cust-${c.id}`.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Card title="Manage Customers">
        <input
          type="text"
          placeholder="Search by ID, name, or email..."
          className="border p-2 mb-4 w-full rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-200">
            <thead className="bg-zinc-200">
              <tr>
                <th className="p-2 text-left">Photo</th>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">QR</th>
                <th className="p-2 text-left">Expiry</th>
                <th className="p-2 text-left">Days Left</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className={`border-t ${
                    customer.days_left <= 0 ? "bg-red-50" : ""
                  }`}
                >
                  {/* Photo */}
                  <td className="p-2">
                    <img
                      src={customer.photo_url}
                      alt="customer"
                      onClick={() => setPreviewCustomer(customer)}
                      className="w-14 h-14 object-cover rounded-xl border shadow-sm cursor-pointer hover:scale-105 transition"
                    />
                  </td>

                  <td className="p-2 font-mono">
                    CUST-{customer.id}
                  </td>

                  <td className="p-2">{customer.full_name}</td>
                  <td className="p-2">{customer.email}</td>

                  {/* QR */}
                  <td className="p-2">
                    <img
                      src={customer.qr_url}
                      alt="qr"
                      onClick={() => setPreviewCustomer(customer)}
                      className="w-16 h-16 border rounded-md cursor-pointer hover:scale-105 transition"
                    />
                  </td>

                  <td className="p-2">
                    {formatDate(customer.subscription_expiry)}
                  </td>

                  <td className="p-2">
                    {typeof customer.days_left === "number" ? (
                      <span
                        className={
                          customer.days_left <= 0
                            ? "text-red-700 font-bold"
                            : customer.days_left <= 5
                            ? "text-red-600 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        {customer.days_left > 0
                          ? `${customer.days_left} days`
                          : "Expired"}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-2 relative">
                    <div className="relative inline-block text-left">
                      <button
                        className="bg-gray-600 text-white px-3 py-1 rounded"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === customer.id ? null : customer.id
                          )
                        }
                      >
                        ⋮
                      </button>

                      {openDropdown === customer.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-20">
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setEditingCustomer(customer);
                              setOpenDropdown(null);
                            }}
                          >
                            ✏️ Edit Information
                          </button>

                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setRenewCustomer(customer);
                              setOpenDropdown(null);
                            }}
                          >
                            🔄 Renew Plan
                          </button>

                          <button
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              deleteCustomer(customer.id);
                              setOpenDropdown(null);
                            }}
                          >
                            ❌ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-zinc-500">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ================= EDIT MODAL ================= */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Edit Information</h3>

            <input
              className="border p-2 w-full rounded"
              value={editingCustomer.full_name}
              onChange={(e) =>
                setEditingCustomer({
                  ...editingCustomer,
                  full_name: e.target.value,
                })
              }
            />

            <input
              className="border p-2 w-full rounded"
              value={editingCustomer.phone_number}
              onChange={(e) =>
                setEditingCustomer({
                  ...editingCustomer,
                  phone_number: e.target.value,
                })
              }
            />

            <input
              className="border p-2 w-full rounded"
              value={editingCustomer.email}
              onChange={(e) =>
                setEditingCustomer({
                  ...editingCustomer,
                  email: e.target.value,
                })
              }
            />

            <Select
              value={String(editingCustomer.plan_id || "")}
              onValueChange={(v) =>
                setEditingCustomer({
                  ...editingCustomer,
                  plan_id: v,
                })
              }
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

            <div className="flex gap-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded flex-1"
                onClick={handleUpdate}
              >
                Save
              </button>

              <button
                className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
                onClick={() => setEditingCustomer(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= RENEW MODAL ================= */}
      {renewCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Renew Plan</h3>

            <Select
              value={String(renewCustomer.plan_id || "")}
              onValueChange={(v) =>
                setRenewCustomer({
                  ...renewCustomer,
                  plan_id: v,
                })
              }
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

            <div className="flex gap-3">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded flex-1"
                onClick={handleRenew}
              >
                Renew
              </button>

              <button
                className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
                onClick={() => setRenewCustomer(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PREVIEW MODAL ================= */}
      {previewCustomer && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={() => setPreviewCustomer(null)}
        >
          <div
            className="bg-white p-6 rounded-2xl w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-6 text-center">
              {previewCustomer.full_name}
            </h3>

            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center">
                <p className="font-medium mb-2">Photo</p>
                <img
                  src={previewCustomer.photo_url}
                  alt="customer"
                  className="w-64 h-64 object-cover rounded-xl border shadow-lg"
                />
              </div>

              <div className="flex flex-col items-center">
                <p className="font-medium mb-2">QR Code</p>
                <img
                  src={previewCustomer.qr_url}
                  alt="qr"
                  className="w-64 h-64 border rounded-xl shadow-lg"
                />
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                className="bg-gray-600 text-white px-6 py-2 rounded-lg"
                onClick={() => setPreviewCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Issue QR / Student">Coming soon…</Card>
        <Card title="Meals & Slots">Coming soon…</Card>
      </div>
    </div>
  );
}