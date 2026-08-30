import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, HeartHandshake, ShieldCheck, Users } from 'lucide-react';

const VALUES = [
  { icon: ShieldCheck, title: 'Trust', description: 'Every listing is reviewed to ensure accuracy and legitimacy.' },
  { icon: Users, title: 'Community', description: 'We connect buyers, renters, owners, and agents on one platform.' },
  { icon: HeartHandshake, title: 'Transparency', description: 'Clear pricing and direct communication, always.' },
];

const About = () => {
  useEffect(() => {
    document.title = 'About Us | Haven Realty';
  }, []);

  return (
    <div>
      <section className="bg-navy-900 py-16 text-center text-white">
        <div className="container-page">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-navy-900">
            <Building2 size={26} />
          </span>
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">About Haven Realty</h1>
          <p className="mx-auto mt-4 max-w-2xl text-navy-200">
            We are on a mission to make property discovery simple, transparent, and accessible to everyone across
            Nigeria.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Our Story</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Haven Realty was built to solve a simple problem: finding a trustworthy place to live or invest in
              shouldn&apos;t be complicated. We bring together verified listings, transparent pricing, and direct
              communication between buyers, renters, and property owners &mdash; all in one modern platform.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Today, thousands of properties across Lagos, Abuja, and beyond are listed on our platform, helping
              families and businesses find spaces that fit their needs and budget.
            </p>
            <Link to="/properties" className="btn-primary mt-6">
              Browse Properties
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
            alt="Modern apartment interior"
            className="h-80 w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="mb-10 text-center text-2xl font-bold text-navy-900">What We Stand For</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                  <Icon size={26} />
                </span>
                <h3 className="mt-4 font-semibold text-navy-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
