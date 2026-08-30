import { useEffect, useMemo, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'react-toastify';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ImageUploader = ({
  files = [],
  onFilesChange,
  existingImages = [],
  onRemoveExisting,
  maxFiles = 10,
}) => {
  const inputRef = useRef(null);

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const totalCount = existingImages.length + files.length;

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds the 5MB size limit`);
        return false;
      }
      return true;
    });

    const combined = [...files, ...valid].slice(0, maxFiles - existingImages.length);
    if (files.length + valid.length > maxFiles - existingImages.length) {
      toast.info(`You can upload a maximum of ${maxFiles} images per property`);
    }
    onFilesChange(combined);
    e.target.value = '';
  };

  const removeNewFile = (index) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {existingImages.map((image) => (
          <div key={image._id} className="group relative h-28 overflow-hidden rounded-lg border border-gray-200">
            <img src={image.url} alt="Property" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemoveExisting(image._id)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {previews.map((url, index) => (
          <div key={url} className="group relative h-28 overflow-hidden rounded-lg border border-gray-200">
            <img src={url} alt="New upload preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeNewFile(index)}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X size={13} />
            </button>
          </div>
        ))}

        {totalCount < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-28 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 text-slate-400 hover:border-navy-400 hover:text-navy-500"
          >
            <ImagePlus size={22} />
            <span className="text-xs font-medium">Add Images</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleSelect}
      />
      <p className="mt-2 text-xs text-slate-400">JPG, PNG or WEBP. Max 5MB per image, up to {maxFiles} images.</p>
    </div>
  );
};

export default ImageUploader;
