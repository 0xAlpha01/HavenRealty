import { motion } from 'framer-motion';
import SearchBar from './SearchBar';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80';

const Hero = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0">
      <img src={HERO_IMAGE} alt="Modern luxury home exterior" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/60 to-navy-900/90" />
    </div>

    <div className="container-page relative flex min-h-[560px] flex-col items-center justify-center py-24 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl"
      >
        Find a place you&apos;ll love to live.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-5 max-w-xl text-base text-navy-100 sm:text-lg"
      >
        Discover homes, apartments, offices, and properties in the locations that matter to you.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-10 w-full max-w-5xl"
      >
        <SearchBar />
      </motion.div>
    </div>
  </section>
);

export default Hero;
