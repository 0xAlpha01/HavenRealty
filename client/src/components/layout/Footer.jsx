import { Link } from 'react-router-dom';
import { Building2, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-gray-100 bg-navy-900 text-navy-100">
    <div className="container-page grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Link to="/" className="flex items-center gap-2 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500 text-navy-900">
            <Building2 size={20} />
          </span>
          <span className="text-lg font-extrabold">Haven Realty</span>
        </Link>
        <p className="mt-4 max-w-xs text-sm text-navy-300">
          Find a place you&apos;ll love to live. We connect buyers, renters, and agents across Nigeria.
        </p>
        <div className="mt-5 flex gap-3">
          {[Facebook, Instagram, Twitter].map((Icon, i) => (
            <span
              key={i}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-navy-200"
            >
              <Icon size={16} />
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Explore</h4>
        <ul className="space-y-2.5 text-sm text-navy-300">
          <li><Link to="/properties" className="hover:text-white">All Properties</Link></li>
          <li><Link to="/properties?listingType=sale" className="hover:text-white">Buy a Home</Link></li>
          <li><Link to="/properties?listingType=rent" className="hover:text-white">Rent a Home</Link></li>
          <li><Link to="/agents" className="hover:text-white">Find an Agent</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
        <ul className="space-y-2.5 text-sm text-navy-300">
          <li><Link to="/about" className="hover:text-white">About Us</Link></li>
          <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          <li><Link to="/dashboard/properties/create" className="hover:text-white">Post a Property</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white">Contact</h4>
        <ul className="space-y-3 text-sm text-navy-300">
          <li className="flex items-center gap-2">
            <MapPin size={16} /> Victoria Island, Lagos, Nigeria
          </li>
          <li className="flex items-center gap-2">
            <Phone size={16} /> +234 800 000 0000
          </li>
          <li className="flex items-center gap-2">
            <Mail size={16} /> hello@havenrealty.example
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-navy-800 py-5">
      <p className="container-page text-center text-xs text-navy-400">
        &copy; {new Date().getFullYear()} Haven Realty. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
