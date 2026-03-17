import { useState } from "react";
import { useExpenses } from "../hooks/useExpenses";
import { useCategories } from "../hooks/useCategories";
import { Plus, Search, Filter, Trash2, Calendar, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function ExpensesPage() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    categoryId: null
  });
  
  const { 
    expenses, 
    total, 
    loading, 
    pagination, 
    setPagination, 
    addExpense, 
    removeExpense 
  } = useExpenses(filters);
  
  const { categories } = useCategories();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    categoryId: null,
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMode: "cash",
    paymentRef: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.categoryId) {
      toast.error("Amount and Category are required");
      return;
    }
    
    try {
      await addExpense(newExpense);
      toast.success("Expense added successfully");
      setShowAddForm(false);
      setNewExpense({
        amount: "",
        categoryId: null,
        description: "",
        expenseDate: new Date().toISOString().split("T")[0],
        paymentMode: "cash",
        paymentRef: ""
      });
    } catch (err) {
      // toast handled in api utils
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await removeExpense(id);
        toast.success("Expense deleted");
      } catch (err) {}
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Expenses</h1>
          <p className="text-zinc-500 text-sm mt-1">Track and manage your business spending</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700 h-11 px-6 text-base shadow-lg shadow-blue-600/20">
          <Plus className="mr-2 h-5 w-5" /> {showAddForm ? "Close Form" : "Add Expense"}
        </Button>
      </div>

      {/* Add/Edit Form Overlay */}
      {showAddForm && (
        <div className="gradient-card p-6 border-blue-100 bg-blue-50/10 animate-in slide-in-from-top duration-300">
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={newExpense.amount} 
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(v) => setNewExpense({...newExpense, categoryId: parseInt(v)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={newExpense.expenseDate} 
                  onChange={(e) => setNewExpense({...newExpense, expenseDate: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-1 md:col-span-1 lg:col-span-2">
                <Label>Description</Label>
                <Input 
                  placeholder="What was this for?" 
                  value={newExpense.description} 
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                 <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Save</Button>
                 <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
           </form>
        </div>
      )}

      {/* Filters */}
      <div className="gradient-card p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <Input placeholder="Search descriptions..." className="pl-10 bg-transparent border-zinc-200" />
        </div>
        
        <Select onValueChange={(v) => setFilters({...filters, categoryId: v === 'all' ? null : parseInt(v)})}>
          <SelectTrigger className="bg-transparent border-zinc-200">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input 
          type="date" 
          className="bg-transparent border-zinc-200" 
          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
        />
        
        <Input 
          type="date" 
          className="bg-transparent border-zinc-200"
          onChange={(e) => setFilters({...filters, endDate: e.target.value})}
        />
      </div>

      {/* Expenses Table */}
      <div className="gradient-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Category</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-left">Mode</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading && expenses.length === 0 ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="p-4"><div className="h-4 bg-zinc-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : expenses.length > 0 ? (
                expenses.map(expense => (
                  <tr key={expense.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-400" />
                        <span className="font-medium">{expense.expenseDate}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${expense.category?.color}20`, color: expense.category?.color }}>
                        <span>{expense.category?.icon}</span>
                        <span>{expense.category?.name}</span>
                      </span>
                    </td>
                    <td className="p-4 text-zinc-600 font-medium">{expense.description || "—"}</td>
                    <td className="p-4">
                       <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <CreditCard size={12} /> {expense.paymentMode}
                       </span>
                    </td>
                    <td className="p-4 text-right text-base font-black text-zinc-900">
                      ₹{parseFloat(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleDelete(expense.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={32} className="opacity-20" />
                      <p className="font-medium">No expenses found matching the filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Toolbar */}
        <div className="p-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
          <p className="text-xs text-zinc-500">Showing {expenses.length} of {total} records</p>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" disabled={pagination.page === 1} onClick={() => setPagination({...pagination, page: pagination.page - 1})}>
                <ChevronLeft size={16} />
             </Button>
             <span className="text-sm font-semibold px-4">{pagination.page}</span>
             <Button variant="outline" size="sm" disabled={expenses.length < pagination.limit} onClick={() => setPagination({...pagination, page: pagination.page + 1})}>
                <ChevronRight size={16} />
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
