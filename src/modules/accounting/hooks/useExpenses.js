import { useState, useCallback, useEffect } from "react";
import * as expenseApi from "../api/expenseApi";

export const useExpenses = (filters = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  const fetchExpenses = useCallback(async (currentFilters = filters, currentPagination = pagination) => {
    setLoading(true);
    setError(null);
    try {
      const response = await expenseApi.getExpenses({
        ...currentFilters,
        page: currentPagination.page,
        limit: currentPagination.limit
      });
      setExpenses(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.page]);

  const addExpense = async (data) => {
    try {
      const response = await expenseApi.createExpense(data);
      // Optional: instead of refetching, prepend for zero-reload feel
      setExpenses(prev => [response.data, ...prev].slice(0, pagination.limit));
      setTotal(prev => prev + 1);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeExpense = async (id) => {
    try {
      await expenseApi.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { 
    expenses, 
    total, 
    loading, 
    error, 
    pagination, 
    setPagination, 
    fetchExpenses, 
    addExpense, 
    removeExpense 
  };
};
