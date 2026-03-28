import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Truck, 
  Package, 
  BarChart3, 
  Settings as SettingsIcon,
  Menu,
  X,
  PackageCheck
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/agents", label: "Agents", icon: Truck },
  { href: "/products", label: "Products", icon: Package },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location !== "/") return false;
    return location.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 text-primary p-2 rounded-xl">
          <PackageCheck className="w-6 h-6" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-slate-900">COD Manager</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group",
                  active 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : "text-slate-400 group-hover:text-slate-600")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            AD
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">System Admin</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/80 flex w-full">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 h-16 flex items-center px-4 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg text-slate-900">COD Manager</span>
          </div>
          <button 
            onClick={() => setMobileOpen(true)}
            className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
