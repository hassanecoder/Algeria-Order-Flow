import { useState } from "react";
import { PageWrapper } from "@/components/PageWrapper";
import { useListProducts, useCreateProduct } from "@workspace/api-client-react";
import { formatDZD } from "@/lib/constants";
import { Plus, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Products() {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useListProducts();
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    defaultPrice: 0,
    stock: 0,
    active: true,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Product created successfully" });
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        setIsAdding(false);
        setFormData({ name: "", sku: "", defaultPrice: 0, stock: 0, active: true });
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  return (
    <PageWrapper 
      title="Products"
      action={
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          {isAdding ? "Cancel" : "Add Product"}
        </button>
      }
    >
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 mb-8 animate-in slide-in-from-top-4 fade-in">
          <h3 className="text-lg font-bold text-slate-900 mb-4">New Product Catalog Entry</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">SKU</label>
              <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (DZD) *</label>
              <input required type="number" value={formData.defaultPrice} onChange={e => setFormData({...formData, defaultPrice: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
            </div>
            <button type="submit" disabled={isCreating} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex justify-center items-center">
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading products...</div>
          ) : data?.products?.length === 0 ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center">
              <Package className="w-12 h-12 text-slate-300 mb-3" />
              No products in catalog.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Default Price</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.products?.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{product.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{product.sku || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{formatDZD(product.defaultPrice)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
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
