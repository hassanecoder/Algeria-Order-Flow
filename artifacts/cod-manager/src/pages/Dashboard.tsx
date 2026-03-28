import { PageWrapper } from "@/components/PageWrapper";
import { useGetAnalyticsSummary, useListOrders } from "@workspace/api-client-react";
import { formatDZD, getStatusConfig } from "@/lib/constants";
import { ArrowUpRight, ArrowDownRight, Package, TrendingUp, Truck, Undo2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAnalyticsSummary();
  const { data: ordersData, isLoading: ordersLoading } = useListOrders({ limit: 5 });

  if (statsLoading || ordersLoading) {
    return (
      <PageWrapper title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse h-32" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: formatDZD(stats?.totalRevenue || 0),
      trend: "+12.5%",
      positive: true,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      trend: "+8.2%",
      positive: true,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Delivery Rate",
      value: `${stats?.deliveryRate || 0}%`,
      trend: "+2.1%",
      positive: true,
      icon: Truck,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Return Rate",
      value: `${stats?.returnRate || 0}%`,
      trend: "-1.4%",
      positive: true, // actually negative trend is good for returns
      icon: Undo2,
      color: "text-rose-600",
      bg: "bg-rose-50"
    }
  ];

  return (
    <PageWrapper title="Dashboard Overview">
      {/* Hero Banner with generated image */}
      <div className="relative w-full h-40 md:h-48 rounded-3xl overflow-hidden mb-8 shadow-sm">
        <img 
          src={`${import.meta.env.BASE_URL}images/dashboard-hero.png`} 
          alt="Dashboard Hero" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/20" />
        <div className="absolute inset-0 p-8 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">Welcome back, Admin</h2>
          <p className="text-slate-200 max-w-lg">Here's what's happening with your COD operations today. You have {stats?.pendingOrders || 0} orders waiting to be processed.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${kpi.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {kpi.positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {kpi.trend}
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-bold font-display text-slate-900">{kpi.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 font-display text-lg">Recent Orders</h3>
            <Link href="/orders">
              <span className="text-sm text-primary font-medium hover:underline cursor-pointer">View all</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersData?.orders?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No recent orders found.</td>
                  </tr>
                ) : (
                  ordersData?.orders?.map((order) => {
                    const statusCfg = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{order.orderNumber}</td>
                        <td className="px-6 py-4 text-slate-600">{order.customerName}<br/><span className="text-xs text-slate-400">{order.wilaya}</span></td>
                        <td className="px-6 py-4 text-slate-600">{order.productName} <span className="text-slate-400">x{order.quantity}</span></td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">{formatDZD(order.totalAmount)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 font-display text-lg mb-6">Today's Summary</h3>
          <div className="space-y-6 flex-1">
            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
              <p className="text-primary text-sm font-semibold mb-1">Orders Today</p>
              <p className="text-3xl font-display font-bold text-primary-foreground! text-slate-900">{stats?.todayOrders || 0}</p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100">
              <p className="text-emerald-700 text-sm font-semibold mb-1">Revenue Today</p>
              <p className="text-3xl font-display font-bold text-emerald-900">{formatDZD(stats?.todayRevenue || 0)}</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/orders/new">
                  <button className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
                    Add Order
                  </button>
                </Link>
                <Link href="/analytics">
                  <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                    View Reports
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
