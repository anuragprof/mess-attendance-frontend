import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { Plus, Trash2, ShieldCheck, Tag, X, Check } from "lucide-react";
import { Button } from "@/Pages/ui/button";
import { Input } from "@/Pages/ui/input";
import { Label } from "@/Pages/ui/label";
import { toast } from "sonner";

export default function CategoriesPage() {
  const { categories, loading, addCategory, removeCategory } = useCategories();
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", icon: "📦", color: "#6366f1" });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    try {
      await addCategory(newCat);
      toast.success("Category added");
      setShowAdd(false);
      setNewCat({ name: "", icon: "📦", color: "#6366f1" });
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this custom category? This might affect existing expense records.")) {
      try {
        await removeCategory(id);
        toast.success("Category removed");
      } catch (err) {}
    }
  };

  const systemCats = categories.filter(c => c.isSystem);
  const vendorCats = categories.filter(c => !c.isSystem);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm border-l-4 border-l-blue-600">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Tag className="text-blue-600" /> Expense Categories
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Organize your spending into meaningful buckets</p>
        </div>
        {!showAdd ? (
          <Button onClick={() => setShowAdd(true)} className="bg-zinc-900 hover:bg-zinc-800 rounded-xl px-5 flex items-center gap-2">
            <Plus size={18} /> New Category
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl px-5 flex items-center gap-2 text-zinc-500">
            <X size={18} /> Close
          </Button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="gradient-card p-6 border-zinc-900/10 bg-zinc-900 text-white animate-in slide-in-from-top duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
             <div className="space-y-2">
                <Label className="text-zinc-400">Category Name</Label>
                <Input 
                  placeholder="e.g. Electricity, Staff, Maintenance" 
                  className="bg-zinc-800 border-zinc-700 text-white h-11"
                  value={newCat.name}
                  onChange={(e) => setNewCat({...newCat, name: e.target.value})}
                />
             </div>
             <div className="space-y-2">
                <Label className="text-zinc-400">Icon / Emoji</Label>
                <Input 
                  placeholder="⚡, 💰, 🏠" 
                  className="bg-zinc-800 border-zinc-700 text-white h-11"
                  value={newCat.icon}
                  onChange={(e) => setNewCat({...newCat, icon: e.target.value})}
                />
             </div>
             <div className="space-y-2">
                <Label className="text-zinc-400">Color (Hex)</Label>
                <Input 
                  type="color"
                  className="bg-zinc-800 border-zinc-700 h-11 px-1 py-1"
                  value={newCat.color}
                  onChange={(e) => setNewCat({...newCat, color: e.target.value})}
                />
             </div>
             <Button type="submit" className="h-11 bg-white text-zinc-900 hover:bg-zinc-100 font-bold px-8">
               <Check size={18} className="mr-2" /> CREATE
             </Button>
          </div>
        </form>
      )}

      {/* System Categories Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <ShieldCheck size={12} /> Standard Categories (Read-Only)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading && categories.length === 0 ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />)
          ) : systemCats.map(cat => (
            <div key={cat.id} className="gradient-card p-4 flex flex-col items-center justify-center text-center gap-3 border-transparent bg-zinc-50/50 hover:bg-white transition-all transform hover:-translate-y-1">
               <span className="text-4xl p-3 bg-white rounded-2xl shadow-sm border border-zinc-50">{cat.icon}</span>
               <span className="font-bold text-zinc-700 text-sm tracking-tight">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Custom Categories Section */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <Tag size={12} /> Custom Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {vendorCats.length > 0 ? vendorCats.map(cat => (
             <div key={cat.id} className="group relative gradient-card p-4 flex flex-col items-center justify-center text-center gap-3 border-zinc-100 hover:border-blue-400 transition-all transform hover:-translate-y-1 overflow-hidden">
                <span className="text-4xl p-3 bg-white rounded-2xl shadow-sm border border-zinc-50">{cat.icon}</span>
                <span className="font-bold text-zinc-700 text-sm tracking-tight">{cat.name}</span>
                
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="absolute top-2 right-2 p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
             </div>
          )) : (
            <div className="col-span-full py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-100 rounded-3xl">
              <p className="text-sm font-medium">No custom categories added yet.</p>
              <p className="text-xs mt-1">Add your own categories to suit your business needs.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
