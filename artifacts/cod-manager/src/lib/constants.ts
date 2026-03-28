export const ALGERIAN_WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", 
  "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", 
  "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", 
  "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", 
  "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", 
  "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", 
  "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", 
  "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "in_transit", label: "In Transit", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "returned", label: "Returned", color: "bg-rose-100 text-rose-800 border-rose-200" },
  { value: "cancelled", label: "Cancelled", color: "bg-slate-100 text-slate-800 border-slate-200" }
];

export const getStatusConfig = (status: string) => {
  return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
};

export const formatDZD = (amount: number) => {
  return new Intl.NumberFormat('en-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
