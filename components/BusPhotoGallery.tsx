import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, X, Upload } from 'lucide-react';
import { getBusPhotos, submitBusPhoto, BusPhoto, getAuthUser } from '../services/communityDataService';
import { trackFeatureUsage } from '../services/analyticsService';

interface Props {
  busId: string;
  busName: string;
  onBack: () => void;
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return 'এইমাত্র';
  if (diff < 60) return `${diff} মিনিট আগে`;
  if (diff < 1440) return `${Math.floor(diff / 60)} ঘণ্টা আগে`;
  return `${Math.floor(diff / 1440)} দিন আগে`;
}

async function compressImage(file: File, maxKB = 280): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length > maxKB * 1024 * 1.37 && quality > 0.3) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function BusPhotoGallery({ busId, busName, onBack }: Props) {
  const user = getAuthUser();
  const [photos, setPhotos] = useState<BusPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState<BusPhoto | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { trackFeatureUsage('bus_photos'); }, []);

  useEffect(() => {
    getBusPhotos(busId).then(p => { setPhotos(p); setLoading(false); });
  }, [busId]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setPreviewUrl(compressed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;
    setSubmitting(true);
    const ok = await submitBusPhoto(busId, busName, caption, previewUrl);
    if (ok) {
      const fresh = await getBusPhotos(busId);
      setPhotos(fresh);
      setShowForm(false);
      setCaption('');
      setPreviewUrl(null);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">বাসের ছবি</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{busName} · {photos.length}টি ছবি</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl">
          <Camera className="w-4 h-4" /> ছবি দিন
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">ছবি আপলোড করুন</h3>

            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="preview" className="w-full rounded-xl object-cover max-h-48" />
                <button type="button" onClick={() => { setPreviewUrl(null); if (fileRef.current) fileRef.current.value = ''; }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-pink-400 hover:text-pink-500 transition-colors">
                <Upload className="w-6 h-6" />
                <span className="text-sm">ছবি নির্বাচন করুন</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            <input value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="ছবির বিবরণ (ঐচ্ছিক)"
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" />

            <div className="flex gap-2">
              <button type="submit" disabled={!previewUrl || submitting}
                className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl">
                {submitting ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setPreviewUrl(null); }}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl">বাতিল</button>
            </div>
          </form>
        )}

        {loading && <div className="text-center py-10 text-gray-400">লোড হচ্ছে...</div>}

        {!loading && photos.length === 0 && !showForm && (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">এখনো কোনো ছবি নেই</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">প্রথম ছবি দিন!</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {photos.map(p => (
            <button key={p.id} onClick={() => setLightbox(p)} className="relative rounded-2xl overflow-hidden aspect-square">
              <img src={p.dataUrl} alt={p.caption || busName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                {p.caption && <p className="text-xs text-white font-medium truncate">{p.caption}</p>}
                <p className="text-xs text-white/70">{timeAgo(p.timestamp)}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="h-4" />
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-white font-semibold">{lightbox.caption || busName}</p>
              <p className="text-white/60 text-xs">{lightbox.displayName} · {timeAgo(lightbox.timestamp)}</p>
            </div>
            <button onClick={() => setLightbox(null)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={lightbox.dataUrl} alt={lightbox.caption || busName} className="max-w-full max-h-full rounded-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
