export const formatPrice = (price, listingType) => {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price || 0);

  return listingType === 'rent' ? `${formatted}/year` : formatted;
};

export const formatNumber = (value) => new Intl.NumberFormat('en-NG').format(value || 0);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const propertyTypeLabel = (type) => {
  const labels = {
    house: 'House',
    apartment: 'Apartment',
    duplex: 'Duplex',
    villa: 'Villa',
    office: 'Office',
    commercial: 'Commercial',
    land: 'Land',
    shop: 'Shop',
  };
  return labels[type] || type;
};

export const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  sold: 'bg-slate-200 text-slate-700',
  rented: 'bg-sky-100 text-sky-700',
};
