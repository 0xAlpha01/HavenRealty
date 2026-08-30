import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

const PropertyGallery = ({ images = [], title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images.length) {
    return <div className="flex h-96 items-center justify-center rounded-xl bg-gray-100 text-gray-400">No images available</div>;
  }

  const showNext = () => setActiveIndex((prev) => (prev + 1) % images.length);
  const showPrev = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div>
      <div className="relative h-96 w-full overflow-hidden rounded-xl bg-gray-100">
        <img
          src={images[activeIndex].url}
          alt={`${title} - image ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 hover:bg-white"
          aria-label="Expand image"
        >
          <Expand size={16} />
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrev}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              type="button"
              key={image._id || index}
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                index === activeIndex ? 'border-gold-500' : 'border-transparent'
              }`}
            >
              <img src={image.url} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-5 top-5 text-white"
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              className="absolute left-4 text-white sm:left-8"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
            <img
              src={images[activeIndex].url}
              alt={`${title} - fullscreen`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              className="absolute right-4 text-white sm:right-8"
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyGallery;
