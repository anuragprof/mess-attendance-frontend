import { useState, useEffect } from "react";
import axios from "@/Lib/axios";
import { toast } from "sonner";
import { Calendar, Download, AlertCircle } from "lucide-react";
import { formatTimeIST } from "@/Lib/utils";
import DailyTrendChart from "@/Components/DailyTrendChart";
import MealDistributionChart from "@/Components/MealDistributionChart";
import RevenueBarChart from "@/Components/RevenueBarChart";

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
  
  // Date states
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Data states
  const [attendanceData, setAttendanceData] = useState({ total_attendance: 0, records: [] });
  const [revenueData, setRevenueData] = useState({ total_revenue: 0, collected: 0, pending: 0 });
  const [defaultersData, setDefaultersData] = useState([]);
  
  // Chart states
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [mealDistribution, setMealDistribution] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Auto-calculate start_date based on timeFilter
  const getFilterDates = () => {
    let _start = date;
    let _end = date;
    
    if (timeFilter === "Daily") {
      _start = date;
      _end = date;
    } else if (timeFilter === "Weekly") {
      const d = new Date(date);
      d.setDate(d.getDate() - 7);
      _start = d.toISOString().split("T")[0];
      _end = date;
    } else if (timeFilter === "Monthly") {
      const d = new Date(date);
      d.setDate(d.getDate() - 30);
      _start = d.toISOString().split("T")[0];
      _end = date;
    } else if (timeFilter === "Custom Range") {
      _start = date;
      _end = endDate;
    }
    
    return { start_date: _start, end_date: _end };
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter, date, endDate, reportType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { start_date, end_date } = getFilterDates();
      const params = { start_date, end_date };

      if (reportType === "Attendance Summary") {
        // Attendance Data
        const attRes = await axios.get("/reports/attendance-summary", {
          params: { type: "custom", start_date, end_date },
          withCredentials: true,
        });
        setAttendanceData(attRes.data);
        
        // Attendance Trend
        const trendRes = await axios.get("/reports/attendance-trend", {
          params, withCredentials: true,
        });
        setAttendanceTrend(trendRes.data);
        
        // Meal Distribution
        const mealRes = await axios.get("/reports/meal-distribution", {
          params, withCredentials: true,
        });
        // Remove empty values for pie chart
        setMealDistribution(mealRes.data.filter(i => i.count > 0).map(i => ({ name: i.meal_type, value: i.count })));

      } else if (reportType === "Revenue Summary") {
        // Revenue Summary
        const revRes = await axios.get("/reports/revenue-summary", {
          withCredentials: true,
        });
        setRevenueData(revRes.data);
        
        // Revenue Trend
        const trendRes = await axios.get("/reports/revenue-trend", {
          params, withCredentials: true,
        });
        setRevenueTrend(trendRes.data);

      } else if (reportType === "Defaulters") {
        const defRes = await axios.get("/reports/defaulters", {
          withCredentials: true,
        });
        setDefaultersData(defRes.data);
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    toast.info("Generating Excel report...");
    
    try {
      const { start_date, end_date } = getFilterDates();
      
      const response = await axios.get("/reports/export-excel", {
        params: { start_date, end_date },
        withCredentials: true,
        responseType: 'blob' // Important for file download
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reports_${start_date}_to_${end_date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      link.parentNode.removeChild(link);
      
      toast.success("Excel report exported successfully");
    } catch (error) {
       console.error("Export error", error);
       toast.error("Failed to generate Excel report");
    } finally {
      setExporting(false);
    }
  };

  const formatDateLabel = () => {
    const { start_date, end_date } = getFilterDates();
    if (start_date === end_date) return new Date(start_date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    return `${start_date} to ${end_date}`;
  };

  // ----------------------------------------------------------------------
  // RENDERERS
  // ----------------------------------------------------------------------

  const renderAttendanceSummary = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
         {/* Summary Card */}
         <div className="gradient-card p-6 flex flex-col items-center justify-center text-center lg:col-span-1">
          <h2 className="text-sm font-bold text-blue-700 tracking-wider uppercase mb-2">
            TOTAL ATTENDANCE
          </h2>
          <div className="text-5xl font-black text-slate-800 tracking-tight">
            {loading ? "..." : attendanceData?.total_attendance || 0}
          </div>
          <p className="text-xs text-zinc-500 mt-2 uppercase">{formatDateLabel()}</p>
        </div>
        
        {/* Charts */}
        <div className="h-[300px] w-full lg:col-span-1">
          {loading ? (
            <div className="gradient-card h-full animate-pulse bg-zinc-100 rounded-xl" />
          ) : attendanceTrend.length > 0 ? (
            <DailyTrendChart data={attendanceTrend} todayTotal={attendanceData?.total_attendance || 0} />
          ) : (
            <div className="gradient-card h-full flex flex-col items-center justify-center text-zinc-400">
               <AlertCircle size={24} className="mb-2 opacity-50" />
               <p className="text-sm">Not enough data for trend</p>
            </div>
          )}
        </div>
        
        <div className="h-[300px] w-full lg:col-span-1">
           {loading ? (
            <div className="gradient-card h-full animate-pulse bg-zinc-100 rounded-xl" />
          ) : mealDistribution.length > 0 ? (
            <MealDistributionChart data={mealDistribution} />
          ) : (
            <div className="gradient-card h-full flex flex-col items-center justify-center text-zinc-400">
               <AlertCircle size={24} className="mb-2 opacity-50" />
               <p className="text-sm">Not enough data for pie chart</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Table Section */}
      <div className="gradient-card p-6">
        <h3 className="text-lg font-bold tracking-tight text-gray-900 mb-4">Detailed Records</h3>
        
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
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-zinc-400">
                     <div className="animate-pulse flex space-x-4 justify-center">
                        <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
                        <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
                     </div>
                  </td>
                </tr>
              ) : attendanceData?.records?.length > 0 ? (
                attendanceData.records.map((record, i) => (
                  <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-3 font-medium text-gray-900">{record.customer_name}</td>
                    <td className="p-3 text-zinc-600">{record.meal_type}</td>
                    <td className="p-3 text-zinc-600 font-medium">{formatTimeIST(record.time)}</td>
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
    </>
  );

  const renderRevenueSummary = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="gradient-card p-6 flex flex-col items-center justify-center text-center">
          <h2 className="text-sm font-bold text-gray-700 tracking-wider uppercase mb-2">Total Billed</h2>
          <div className="text-4xl font-black text-slate-800 tracking-tight">
            ₹{loading ? "..." : (revenueData?.total_revenue || 0).toLocaleString()}
          </div>
        </div>
        <div className="gradient-card p-6 flex flex-col items-center justify-center text-center backdrop-blur-md bg-emerald-50/50 border-emerald-100">
          <h2 className="text-sm font-bold text-emerald-700 tracking-wider uppercase mb-2">Collected</h2>
          <div className="text-4xl font-black text-emerald-800 tracking-tight">
            ₹{loading ? "..." : (revenueData?.collected || 0).toLocaleString()}
          </div>
        </div>
        <div className="gradient-card p-6 flex flex-col items-center justify-center text-center backdrop-blur-md bg-amber-50/50 border-amber-100">
          <h2 className="text-sm font-bold text-amber-700 tracking-wider uppercase mb-2">Pending</h2>
          <div className="text-4xl font-black text-amber-800 tracking-tight">
            ₹{loading ? "..." : (revenueData?.pending || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="h-[300px] mb-6">
         {loading ? (
            <div className="gradient-card h-full animate-pulse bg-zinc-100 rounded-xl" />
          ) : revenueTrend.length > 0 ? (
            <RevenueBarChart data={revenueTrend} total={revenueData?.collected || 0} />
          ) : (
            <div className="gradient-card h-full flex flex-col items-center justify-center text-zinc-400">
               <AlertCircle size={24} className="mb-2 opacity-50" />
               <p className="text-sm">Not enough data for chart</p>
            </div>
          )}
      </div>
    </>
  );

  const renderDefaulters = () => (
    <div className="gradient-card p-6">
      <h3 className="text-lg font-bold tracking-tight text-red-700 mb-4">Unpaid Balances</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-red-50/50 border-b border-red-100 text-xs uppercase text-red-800 tracking-wider">
            <tr>
              <th className="p-3 text-left font-medium">Customer Name</th>
              <th className="p-3 text-left font-medium">Phone Number</th>
              <th className="p-3 text-left font-medium">Plan Name</th>
              <th className="p-3 text-right font-medium">Pending Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
               <tr>
               <td colSpan="4" className="p-8 text-center text-zinc-400">
                  <div className="animate-pulse flex space-x-4 justify-center">
                     <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
                  </div>
               </td>
             </tr>
            ) : defaultersData?.length > 0 ? (
              defaultersData.map((record, i) => (
                <tr key={i} className="hover:bg-red-50/30 transition-colors">
                  <td className="p-3 font-medium text-gray-900">{record.customer_name}</td>
                  <td className="p-3 text-zinc-600">{record.phone_number}</td>
                  <td className="p-3 text-zinc-600">{record.plan_name}</td>
                  <td className="p-3 text-right font-bold text-red-600">
                    ₹{record.pending_amount.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center text-emerald-600">
                    <p className="font-medium text-lg">Hooray! No pending payments.</p>
                    <p className="text-sm text-emerald-600/70 mt-1">All customers are up to date.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ----------------------------------------------------------------------
  // MAIN RETURN
  // ----------------------------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Header - In case Topbar isn't enough, we show it here per prompt instructions */}
      <div className="mb-6 lg:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reports</h1>
        <p className="text-zinc-500 text-sm mt-1">Analyze mess attendance and revenue.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Controls */}
        <div className="w-full lg:w-80 space-y-6 shrink-0">
          <div className="gradient-card p-6 space-y-4 sticky top-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Select Report</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full bg-white rounded-xl">
                  <SelectValue placeholder="Select Report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Attendance Summary">Attendance Summary</SelectItem>
                  <SelectItem value="Revenue Summary">Revenue Summary</SelectItem>
                  <SelectItem value="Defaulters">Defaulters List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType !== "Defaulters" && (
            <>
              <div className="pt-2">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Time Period</label>
                <div className="flex flex-row flex-wrap gap-2">
                  {["Daily", "Weekly", "Monthly", "Custom Range"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setTimeFilter(tab)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        timeFilter === tab
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent"
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
                    {timeFilter === "Custom Range" || timeFilter !== "Daily" ? "Reference Date / End Date" : "Date"}
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
                      min={date} // cannot end before start
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-zinc-900"
                    />
                  </div>
                )}
              </div>
            </>
            )}

            <div className="pt-4 border-t border-zinc-100">
               <button 
                  onClick={handleExport}
                  disabled={exporting || loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50"
               >
                  {exporting ? (
                     <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                     <Download size={16} />
                  )}
                  {exporting ? "Generating..." : "Export Excel"}
               </button>
               <p className="text-[10px] text-zinc-400 text-center mt-2 px-2 leading-tight">
                  Downloads active date range for Attendance, Revenue, and Transactions
               </p>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full">
          {reportType === "Attendance Summary" && renderAttendanceSummary()}
          {reportType === "Revenue Summary" && renderRevenueSummary()}
          {reportType === "Defaulters" && renderDefaulters()}
        </div>

      </div>
    </div>
  );
}

