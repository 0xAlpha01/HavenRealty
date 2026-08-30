import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartHandshake, ShieldCheck, TrendingUp } from 'lucide-react';
import Hero from '../components/home/Hero';
import PropertyTypeSection from '../components/home/PropertyTypeSection';
import PropertyGrid from '../components/property/PropertyGrid';
import propertyService from '../services/propertyService';
import { getErrorMessage } from '../services/api';
import { toast } from 'react-toastify';

const WHY_US = [
  {
    icon: ShieldCheck,
    title: 'Verified Listings',
    description: 'Every property is reviewed by our team before it goes live on the platform.',
  },
  {
    icon: TrendingUp,
    title: 'Market Insight',
    description: 'Get accurate pricing informed by real transactions across Nigeria.',
  },
  {
    icon: HeartHandshake,
    title: 'Direct Connection',
    description: 'Message agents and owners directly - no middlemen, no hidden fees.',
  },
];

const Home = () => {
  useEffect(() => {
    document.title = 'Haven Realty | Find Your Perfect Property';
  }, []);

  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyService
      .getFeaturedProperties(6)
      .then((res) => setFeatured(res.data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Hero />
      <PropertyTypeSection />

      <section className="bg-white py-16">
        <div className="container-page">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-navy-900">Featured Properties</h2>
              <p className="mt-2 text-slate-500">Hand-picked listings our team recommends this week</p>
            </div>
            <Link to="/properties" className="hidden items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-900 sm:flex">
              View all properties <ArrowRight size={16} />
            </Link>
          </div>

          <PropertyGrid
            properties={featured}
            loading={loading}
            emptyTitle="No featured properties yet"
            emptyDescription="Check back soon for our curated selection of properties."
          />

          <div className="mt-8 text-center sm:hidden">
            <Link to="/properties" className="btn-outline">
              View all properties
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-navy-900">Why Choose Haven Realty</h2>
          <p className="mt-2 text-slate-500">A trusted platform for property discovery in Nigeria</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {WHY_US.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card p-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-600">
                <Icon size={26} />
              </span>
              <h3 className="mt-4 font-semibold text-navy-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 py-16">
        <div className="container-page flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-navy-800 to-navy-900 px-8 py-12 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Have a property to list?</h2>
            <p className="mt-2 text-navy-200">Reach thousands of buyers and renters by listing with Haven Realty today.</p>
          </div>
          <Link to="/dashboard/properties/create" className="btn-gold shrink-0">
            Post a Property <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
