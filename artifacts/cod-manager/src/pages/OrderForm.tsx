import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { PageWrapper } from "@/components/PageWrapper";
import { useCreateOrder, useGetOrder, useUpdateOrder, useListProducts, useListAgents } from "@workspace/api-client-react";
import { ALGERIAN_WILAYAS } from "@/lib/constants";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function OrderForm() {
  const [match, params] = useRoute("/orders/:id/edit");
  const isEdit = match && params?.id !== undefined;
  const orderId = isEdit ? Number(params.id) : 0;
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orderToEdit, isLoading: loadingEdit } = useGetOrder(orderId, {
    query: { enabled: isEdit }
  });
  
  const { data: productsData } = useListProducts();
  const { data: agentsData } = useListAgents({});

  const { mutate: createOrder, isPending: isCreating } = useCreateOrder();
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerPhone2: "",
    wilaya: "Alger",
    commune: "",
    address: "",
    productName: "",
    productId: "",
    quantity: 1,
    unitPrice: 0,
    shippingCost: 500,
    agentId: "",
    notes: ""
  });

  useEffect(() => {
    if (isEdit && orderToEdit) {
      setFormData({
        customerName: orderToEdit.customerName,
        customerPhone: orderToEdit.customerPhone,
        customerPhone2: orderToEdit.customerPhone2 || "",
        wilaya: orderToEdit.wilaya,
        commune: orderToEdit.commune,
        address: orderToEdit.address,
        productName: orderToEdit.productName,
        productId: orderToEdit.productId?.toString() || "",
        quantity: orderToEdit.quantity,
        unitPrice: orderToEdit.unitPrice,
        shippingCost: orderToEdit.shippingCost,
        agentId: orderToEdit.agentId?.toString() || "",
        notes: orderToEdit.notes || ""
      });
    }
  }, [isEdit, orderToEdit]);

  const handleProductSelect = (id: string) => {
    const product = productsData?.products.find(p => p.id.toString() === id);
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId: id,
        productName: product.name,
        unitPrice: product.defaultPrice
      }));
    } else {
      setFormData(prev => ({ ...prev, productId: id }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      customerPhone2: formData.customerPhone2 || null,
      productId: formData.productId ? Number(formData.productId) : null,
      agentId: formData.agentId ? Number(formData.agentId) : null,
      notes: formData.notes || null,
    };

    if (isEdit) {
      updateOrder({ id: orderId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Success", description: "Order updated successfully" });
          queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
          setLocation("/orders");
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    } else {
      createOrder({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Success", description: "Order created successfully" });
          queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
          setLocation("/orders");
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const isPending = isCreating || isUpdating;

  if (isEdit && loadingEdit) {
    return <PageWrapper title="Edit Order"><div className="p-12 text-center">Loading...</div></PageWrapper>;
  }

  return (
    <PageWrapper 
      title={isEdit ? `Edit Order #${orderToEdit?.orderNumber}` : "Create New Order"}
      action={
        <button 
          onClick={() => setLocation("/orders")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Customer Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</div>
                Customer Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name *</label>
                  <input required name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number *</label>
                  <input required name="customerPhone" value={formData.customerPhone} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alternative Phone</label>
                  <input name="customerPhone2" value={formData.customerPhone2} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Wilaya *</label>
                  <select required name="wilaya" value={formData.wilaya} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none">
                    {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Commune *</label>
                  <input required name="commune" value={formData.commune} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Address *</label>
                  <input required name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">2</div>
                Order Items
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Selection</label>
                  <select 
                    value={formData.productId} 
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                  >
                    <option value="">Custom Product (Type below)</option>
                    {productsData?.products?.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.defaultPrice} DZD</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-7">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
                  <input required name="productName" value={formData.productName} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantity *</label>
                  <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit Price (DZD) *</label>
                  <input required type="number" min="0" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Shipping (DZD) *</label>
                  <input required type="number" min="0" name="shippingCost" value={formData.shippingCost} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Summary */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Financial Summary</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Subtotal</span>
                  <span>{formData.quantity * formData.unitPrice} DZD</span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Shipping</span>
                  <span>{formData.shippingCost} DZD</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between font-bold text-lg text-slate-900">
                  <span>Total</span>
                  <span>{(formData.quantity * formData.unitPrice) + formData.shippingCost} DZD</span>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Assign Agent (Optional)</label>
                  <select name="agentId" value={formData.agentId} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none">
                    <option value="">-- Auto-assign later --</option>
                    {agentsData?.agents?.map(a => <option key={a.id} value={a.id}>{a.name} ({a.wilaya})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none" placeholder="Special instructions..."></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isEdit ? "Update Order" : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </PageWrapper>
  );
}
