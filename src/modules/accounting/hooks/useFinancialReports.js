import { useState, useCallback, useEffect } from "react";
import * as reportApi from "../api/reportApi";

export const useFinancialReports = (dateRange) => {
  const [profitSummary, setProfitSummary] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    if (!dateRange?.startDate || !dateRange?.endDate) return;
    
    setLoading(true);
    setError(null);
    try {
      const [summary, breakdown, trend] = await Promise.all([
        reportApi.getProfitSummary(dateRange),
        reportApi.getExpenseByCategory(dateRange),
        reportApi.getIncomeVsExpenseTrend(dateRange)
      ]);
      
      setProfitSummary(summary.data);
      setCategoryBreakdown(breakdown.data);
      setTrendData(trend.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { profitSummary, categoryBreakdown, trendData, loading, error, fetchReports };
};
