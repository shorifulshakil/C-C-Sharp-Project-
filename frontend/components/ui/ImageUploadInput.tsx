'use client';

import { useState, useRef, ChangeEvent } from 'react';

interface ImageUploadInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  aspectRatio?: 'circle' | 'square';
  fallbackIcon?: string;
  helperText?: string;
}

export function ImageUploadInput({
  label,
  value,
  onChange,
  placeholder = 'Paste image URL or upload file...',
  aspectRatio = 'square',
  fallbackIcon = '🖼️',
  helperText = 'Provide a direct image URL or upload an image file from your computer.',
}: ImageUploadInputProps) {
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-800">{label}</label>
        <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mode === 'url' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            🔗 Image URL
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              mode === 'file' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            📁 Upload File
          </button>
        </div>
      </div>

      <div className="flex items-start gap-4">
        {/* Live Preview Box */}
        <div className="relative group shrink-0">
          <div
            className={`overflow-hidden border-2 border-dashed border-indigo-200 bg-indigo-50/40 flex items-center justify-center shadow-sm transition-all ${
              aspectRatio === 'circle' ? 'w-20 h-20 rounded-full' : 'w-20 h-20 rounded-2xl'
            }`}
          >
            {value ? (
              <img src={value} alt={label} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{fallbackIcon}</span>
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              title="Remove Image"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2">
          {mode === 'url' ? (
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              />
              <label
                htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-700 rounded-xl text-sm font-semibold transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Choose Local Image File
              </label>
              {value && mode === 'file' && (
                <span className="ml-3 text-xs text-emerald-600 font-medium">✓ Image Loaded</span>
              )}
            </div>
          )}
          <p className="text-xs text-neutral-400">{helperText}</p>
        </div>
      </div>
    </div>
  );
}
