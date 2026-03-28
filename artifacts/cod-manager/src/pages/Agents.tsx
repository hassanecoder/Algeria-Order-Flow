import { useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { useListAgents, useCreateAgent } from "@workspace/api-client-react";
import { ALGERIAN_WILAYAS } from "@/lib/constants";
import { Search, Plus, MapPin, CheckCircle2, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Agents() {
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListAgents({ search: search || undefined });
  const { mutate: createAgent, isPending: isCreating } = useCreateAgent();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    wilaya: "Alger",
    status: "active" as "active" | "inactive",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAgent({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Agent created successfully" });
        queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
        setIsAdding(false);
        setFormData({ name: "", phone: "", wilaya: "Alger", status: "active" });
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  return (
    <PageWrapper 
      title="Delivery Agents"
      action={
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          {isAdding ? "Cancel" : "Add Agent"}
        </button>
      }
    >
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 mb-8 animate-in slide-in-from-top-4 fade-in">
          <h3 className="text-lg font-bold text-slate-900 mb-4">New Delivery Agent</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name *</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone *</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Wilaya Zone *</label>
              <select required value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none">
                {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <button type="submit" disabled={isCreating} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex justify-center items-center">
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Agent"}
            </button>
          </form>
        </div>
      )}

      <div className="mb-6 relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search agents..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-slate-500 animate-pulse">Loading agents...</div>
      ) : data?.agents?.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500">No agents found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.agents?.map(agent => (
            <div key={agent.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all group overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-display font-bold text-xl">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{agent.name}</h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${agent.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" /> Covers: <span className="font-medium text-slate-900">{agent.wilaya}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" /> Success Rate: <span className="font-medium text-emerald-600">{agent.successRate}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-slate-900">{agent.totalDeliveries}</div>
                    <div className="text-xs text-slate-500 font-medium">Total Deliveries</div>
                  </div>
                  <div className="text-center border-l border-slate-100">
                    <div className="text-2xl font-display font-bold text-primary">{agent.currentOrders}</div>
                    <div className="text-xs text-slate-500 font-medium">Active Orders</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
