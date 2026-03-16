import { useState, useEffect } from "react";
import axios from "@/Lib/axios";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Pages/ui/select";

export default function Reports() {
  const [reportType, setReportType] = useState("Attendance Summary");
  const [timeFilter, setTimeFilter] = useState("Daily");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState({ total_attendance: 0, records: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reportType === "Attendance Summary") {
      fetchData();
    }
  }, [timeFilter, date, endDate, reportType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        type: timeFilter === "Custom Range" ? "custom" : timeFilter.toLowerCase(),
        date: date,
      };
      if (timeFilter === "Custom Range") {
        params.end_date = endDate;
      }

      const res = await axios.get("/attendance/report", {
        params,
        withCredentials: true,
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch records. Showing sample data.");
      // Fallback to sample data for visual demonstration
      setData({
        total_attendance: 120,
        records: [
          { customer: "Rahul Patil", meal: "Lunch", time: "13:10", status: "Present" },
          { customer: "Sneha Sharma", meal: "Dinner", time: "20:30", status: "Present" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = () => {
    if (timeFilter === "Custom Range") return `${date} to ${endDate}`;
    return new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Header - In case Topbar isn't enough, we show it here per prompt instructions */}
      <div className="mb-6 lg:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reports</h1>
        <p className="text-zinc-500 text-sm mt-1">Analyze mess attendance and meal counts.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="gradient-card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Select Report</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full bg-white rounded-xl">
                  <SelectValue placeholder="Select Report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Attendance Summary">Attendance Summary</SelectItem>
                  <SelectItem value="Meal Counts">Meal Counts</SelectItem>
                  <SelectItem value="Customer Usage">Customer Usage</SelectItem>
                  <SelectItem value="Revenue Summary">Revenue Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-zinc-700 mb-2">Time Period</label>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 overflow-x-auto pb-2 sm:pb-0">
                {["Daily", "Weekly", "Monthly", "Custom Range"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTimeFilter(tab)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      timeFilter === tab
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  {timeFilter === "Custom Range" ? "Start Date" : "Date"}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-zinc-900"
                />
              </div>

              {timeFilter === "Custom Range" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-zinc-900"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Summary Card */}
          <div className="gradient-card p-8 flex flex-col items-center justify-center text-center">
            <h2 className="text-sm font-bold text-blue-700 tracking-wider uppercase mb-2">
              TOTAL ATTENDANCE FOR {formatDateLabel()}
            </h2>
            <div className="text-6xl font-black text-slate-800 tracking-tight">
              {loading ? "..." : data?.total_attendance || 0}
            </div>
          </div>

          {/* Data Table Section */}
          <div className="gradient-card p-6">
            <h3 className="text-lg font-bold tracking-tight text-gray-900 mb-4">Attendance Records</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-zinc-50/50 border-b border-zinc-200 text-xs uppercase text-zinc-500 tracking-wider">
                  <tr>
                    <th className="p-3 text-left font-medium">Customer Name</th>
                    <th className="p-3 text-left font-medium">Meal Type</th>
                    <th className="p-3 text-left font-medium">Time</th>
                    <th className="p-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {!loading && data?.records?.length > 0 ? (
                    data.records.map((record, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-3 font-medium text-gray-900">{record.customer}</td>
                        <td className="p-3 text-zinc-600">{record.meal}</td>
                        <td className="p-3 text-zinc-600">{record.time}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            record.status === "Present" ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-600"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-400">
                          <Calendar size={32} className="mb-2 opacity-50" />
                          <p>No attendance records found for this period</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}
