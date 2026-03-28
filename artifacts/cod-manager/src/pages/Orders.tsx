import { useState } from "react";
import { Link } from "wouter";
import { PageWrapper } from "@/components/PageWrapper";
import { useListOrders, useUpdateOrderStatus, OrderStatus } from "@workspace/api-client-react";
import { ALGERIAN_WILAYAS, formatDZD, getStatusConfig, ORDER_STATUSES } from "@/lib/constants";
import { Search, Plus, Filter, MoreHorizontal, Check, X, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListOrders({
    search: search || undefined,
    status: statusFilter || undefined,
    wilaya: wilayaFilter || undefined,
    limit: 50
  });

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const handleStatusChange = (id: number, newStatus: OrderStatus) => {
    updateStatus({ id, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
        toast({ title: "Status Updated", description: `Order status changed to ${newStatus}` });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message || "Failed to update status", variant: "destructive" });
      }
    });
  };

  return (
    <PageWrapper 
      title="Orders" 
      action={
        <Link href="/orders/new">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0">
            <Plus className="w-5 h-5" />
            New Order
          </button>
        </Link>
      }
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by order #, customer, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1 md:flex-none appearance-none"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            
            <select 
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1 md:flex-none appearance-none"
            >
              <option value="">All Wilayas</option>
              {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading orders...</div>
          ) : data?.orders?.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No orders found</h3>
              <p className="text-slate-500">Try adjusting your filters or create a new order.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.orders?.map((order) => {
                  const statusCfg = getStatusConfig(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{order.orderNumber}</div>
                        <div className="text-xs text-slate-500 mt-1">{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{order.customerName}</div>
                        <div className="text-slate-500">{order.customerPhone}</div>
                        <div className="text-xs text-slate-400 mt-1">{order.wilaya}, {order.commune}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 font-medium">{order.productName}</div>
                        <div className="text-slate-500 text-xs mt-1">Qty: {order.quantity} • {formatDZD(order.unitPrice)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{formatDZD(order.totalAmount)}</div>
                        <div className="text-xs text-slate-500 mt-1">+ {formatDZD(order.shippingCost)} Ship</div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/40 ${statusCfg.color}`}
                        >
                          {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/orders/${order.id}/edit`}>
                          <button className="text-primary hover:text-primary/80 font-medium text-sm py-1.5 px-3 hover:bg-primary/10 rounded-lg transition-colors">
                            Edit
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination simple mock */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center text-sm text-slate-500">
          <div>Showing {data?.orders?.length || 0} of {data?.total || 0} results</div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled={!data || data.page >= data.totalPages}>Next</button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
