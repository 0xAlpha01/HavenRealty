import { useState } from 'react';
import { X } from 'lucide-react';

const TagInput = ({ label, tags, onChange, placeholder = 'Type and press Enter', suggestions = [] }) => {
  const [value, setValue] = useState('');

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setValue('');
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(value);
    }
  };

  const unusedSuggestions = suggestions.filter((s) => !tags.includes(s));

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>}
      <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 bg-white p-2.5">
        {tags.map((tag) => (
          <span key={tag} className="badge flex items-center gap-1 bg-navy-50 text-navy-700">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(value)}
          placeholder={placeholder}
          className="min-w-[140px] flex-1 border-none text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {unusedSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unusedSuggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => addTag(suggestion)}
              className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-slate-500 hover:border-navy-300 hover:text-navy-700"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
