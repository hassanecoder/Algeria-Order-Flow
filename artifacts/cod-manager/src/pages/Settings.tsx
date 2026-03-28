import { useState, useEffect } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Save, Building2, Phone, Truck, Package, Settings } from "lucide-react";

export default function SettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { toast } = useToast();

  const [form, setForm] = useState({
    companyName: "",
    companyPhone: "",
    defaultShippingCost: 500,
    currency: "DZD",
    lowStockThreshold: 10,
    autoConfirmOrders: false,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        companyName: settings.companyName,
        companyPhone: settings.companyPhone,
        defaultShippingCost: settings.defaultShippingCost,
        currency: settings.currency,
        lowStockThreshold: settings.lowStockThreshold,
        autoConfirmOrders: settings.autoConfirmOrders,
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ data: form }, {
      onSuccess: () => {
        toast({ title: "Settings saved", description: "Your settings have been updated successfully." });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <PageWrapper title="Settings">
        <div className="max-w-2xl space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm h-24 animate-pulse" />
          ))}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Settings">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-800">Company Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Your company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={form.companyPhone}
                  onChange={e => setForm(f => ({ ...f, companyPhone: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="05xxxxxxxx"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Truck className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-800">Delivery Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Default Shipping Cost (DZD)</label>
              <input
                type="number"
                value={form.defaultShippingCost}
                onChange={e => setForm(f => ({ ...f, defaultShippingCost: Number(e.target.value) }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                min={0}
                step={50}
              />
              <p className="text-xs text-slate-400 mt-1">This will be pre-filled when creating new orders.</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-medium text-slate-700 text-sm">Auto-Confirm Orders</p>
                <p className="text-xs text-slate-400 mt-0.5">Automatically confirm new orders when created</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, autoConfirmOrders: !f.autoConfirmOrders }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.autoConfirmOrders ? "bg-primary" : "bg-slate-200"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.autoConfirmOrders ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-800">Inventory Settings</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Low Stock Threshold</label>
            <input
              type="number"
              value={form.lowStockThreshold}
              onChange={e => setForm(f => ({ ...f, lowStockThreshold: Number(e.target.value) }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              min={1}
            />
            <p className="text-xs text-slate-400 mt-1">Products with stock below this number will be marked as low stock.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-slate-800">Display Settings</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Currency</label>
            <select
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="DZD">DZD - Algerian Dinar</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isPending ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </PageWrapper>
  );
}
