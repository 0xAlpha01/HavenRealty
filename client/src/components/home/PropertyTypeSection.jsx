import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Building2, Home, Landmark, MapPinned, Store, Trees, Warehouse } from 'lucide-react';
import propertyService from '../../services/propertyService';

const CATEGORIES = [
  { type: 'house', label: 'Houses', icon: Home },
  { type: 'apartment', label: 'Apartments', icon: Building },
  { type: 'duplex', label: 'Duplexes', icon: Building2 },
  { type: 'villa', label: 'Villas', icon: Landmark },
  { type: 'office', label: 'Offices', icon: Warehouse },
  { type: 'commercial', label: 'Commercial', icon: Store },
  { type: 'land', label: 'Land', icon: Trees },
  { type: 'shop', label: 'Shops', icon: MapPinned },
];

const PropertyTypeSection = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    propertyService
      .getCategoryCounts()
      .then((res) => setCounts(res.data))
      .catch(() => setCounts({}));
  }, []);

  return (
    <section className="container-page py-16">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-navy-900">Browse by Property Type</h2>
        <p className="mt-2 text-slate-500">Explore properties across every category</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map(({ type, label, icon: Icon }, index) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              to={`/properties?type=${type}`}
              className="card flex flex-col items-center gap-3 px-4 py-8 text-center transition-transform hover:-translate-y-1"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                <Icon size={26} />
              </span>
              <span className="font-semibold text-navy-900">{label}</span>
              <span className="text-xs text-slate-500">{counts[type] || 0} properties</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PropertyTypeSection;
