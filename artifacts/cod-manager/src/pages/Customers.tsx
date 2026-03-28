import { useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { useListCustomers } from "@workspace/api-client-react";
import { formatDZD, ALGERIAN_WILAYAS } from "@/lib/constants";
import { Search, MapPin, Phone, PackageCheck, Undo2 } from "lucide-react";
import { format } from "date-fns";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("");

  const { data, isLoading } = useListCustomers({
    search: search || undefined,
    wilaya: wilayaFilter || undefined,
    limit: 50
  });

  return (
    <PageWrapper title="Customers">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div className="w-full md:w-auto">
            <select 
              value={wilayaFilter}
              onChange={(e) => setWilayaFilter(e.target.value)}
              className="w-full md:w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">All Wilayas</option>
              {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading customers...</div>
          ) : data?.customers?.length === 0 ? (
            <div className="p-16 text-center">No customers found.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact & Location</th>
                  <th className="px-6 py-4 text-center">Performance</th>
                  <th className="px-6 py-4 text-right">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.customers?.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-base">{customer.name}</div>
                          <div className="text-xs text-slate-500">Joined {format(new Date(customer.createdAt), "MMM yyyy")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-700 font-medium mb-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {customer.wilaya}, {customer.commune}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-4">
                        <div className="flex flex-col items-center" title="Delivered Orders">
                          <PackageCheck className="w-4 h-4 text-emerald-500 mb-1" />
                          <span className="font-bold text-slate-900">{customer.deliveredOrders}</span>
                        </div>
                        <div className="flex flex-col items-center" title="Returned Orders">
                          <Undo2 className="w-4 h-4 text-rose-500 mb-1" />
                          <span className="font-bold text-slate-900">{customer.returnedOrders}</span>
                        </div>
                      </div>
                      <div className="text-center text-xs text-slate-400 mt-1">
                        {customer.totalOrders} total orders
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-display font-bold text-lg text-primary">{formatDZD(customer.totalSpent)}</div>
                      <div className="text-xs text-slate-500">Lifetime value</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
