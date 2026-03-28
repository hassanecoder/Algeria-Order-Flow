import { useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import {
  useGetAnalyticsSummary,
  useGetAnalyticsByWilaya,
  useGetAnalyticsByStatus,
  useGetRevenueTrend,
} from "@workspace/api-client-react";
import { formatDZD, getStatusConfig } from "@/lib/constants";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  in_transit: "#8b5cf6",
  delivered: "#10b981",
  returned: "#f43f5e",
  cancelled: "#94a3b8",
};

const WILAYA_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#06b6d4", "#84cc16", "#f97316"];

export default function Analytics() {
  const [days, setDays] = useState(30);

  const { data: summary } = useGetAnalyticsSummary();
  const { data: byWilaya } = useGetAnalyticsByWilaya();
  const { data: byStatus } = useGetAnalyticsByStatus();
  const { data: revenueTrend } = useGetRevenueTrend({ days });

  const topWilayas = byWilaya?.slice(0, 8) ?? [];
  const statusData = byStatus ?? [];
  const trendData = revenueTrend ?? [];

  return (
    <PageWrapper title="Analytics">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-slate-500 text-sm">Performance overview and trends</p>
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: formatDZD(summary?.totalRevenue ?? 0), color: "text-blue-600" },
            { label: "Delivery Rate", value: `${summary?.deliveryRate ?? 0}%`, color: "text-emerald-600" },
            { label: "Return Rate", value: `${summary?.returnRate ?? 0}%`, color: "text-rose-600" },
            { label: "Avg Order Value", value: formatDZD(summary?.avgOrderValue ?? 0), color: "text-purple-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-slate-500 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Revenue Trend</h3>
            {trendData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={d => {
                    try { return format(new Date(d), "dd/MM"); } catch { return d; }
                  }} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatDZD(value), "Revenue"]}
                    labelFormatter={label => {
                      try { return format(new Date(label), "dd MMM yyyy"); } catch { return label; }
                    }}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Orders by Status</h3>
            {statusData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                      {statusData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _name: string, props: { payload?: { status: string } }) => [value, props.payload?.status ?? ""]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {statusData.map(s => {
                    const config = getStatusConfig(s.status);
                    return (
                      <div key={s.status} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[s.status] ?? "#94a3b8" }} />
                          <span className="text-slate-600 capitalize">{config.label}</span>
                        </div>
                        <span className="font-medium text-slate-800">{s.count} ({s.percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Top Wilayas by Orders</h3>
          {topWilayas.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topWilayas} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="wilaya" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                />
                <Legend />
                <Bar dataKey="totalOrders" name="Total Orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="deliveredOrders" name="Delivered" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Revenue by Wilaya</h3>
          {topWilayas.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100">
                    <th className="pb-3 font-medium">Wilaya</th>
                    <th className="pb-3 font-medium text-right">Total Orders</th>
                    <th className="pb-3 font-medium text-right">Delivered</th>
                    <th className="pb-3 font-medium text-right">Rate</th>
                    <th className="pb-3 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topWilayas.map((w, i) => (
                    <tr key={w.wilaya} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: WILAYA_COLORS[i % WILAYA_COLORS.length] }} />
                          {w.wilaya}
                        </div>
                      </td>
                      <td className="py-3 text-right text-slate-600">{w.totalOrders}</td>
                      <td className="py-3 text-right text-emerald-600">{w.deliveredOrders}</td>
                      <td className="py-3 text-right text-slate-600">
                        {w.totalOrders > 0 ? Math.round((w.deliveredOrders / w.totalOrders) * 100) : 0}%
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-800">{formatDZD(w.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
