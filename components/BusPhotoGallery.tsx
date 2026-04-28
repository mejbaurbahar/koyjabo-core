import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { getBusPhotos, submitBusPhoto, BusPhoto, getAuthUser } from '../services/communityDataService';
import { trackFeatureUsage } from '../services/analyticsService';
import { getBusImagePath } from '../utils/busImageMapper';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  busId: string;
  busName: string;
  busBnName?: string;
  onBack: () => void;
}

function timeAgo(ts: number, t: (key: string, params?: Record<string, string | number>) => string, formatNumber: (n: number | string) => string): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return t('history.justNow');
  if (diff < 60) return `${formatNumber(diff)} ${t('history.minutesAgo')}`;
  if (diff < 1440) return `${formatNumber(Math.floor(diff / 60))} ${t('history.hoursAgo')}`;
  return `${formatNumber(Math.floor(diff / 1440))} ${t('history.daysAgo')}`;
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

function PhotoSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="aspect-square rounded-2xl bg-gray-200 dark:bg-slate-700" />
      ))}
    </div>
  );
}

export default function BusPhotoGallery({ busId, busName, busBnName, onBack }: Props) {
  const user = getAuthUser();
  const { t, formatNumber } = useLanguage();
  const [photos, setPhotos] = useState<BusPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState<BusPhoto | null>(null);
  const [officialSrc, setOfficialSrc] = useState<string | null>(null);
  const [hasOfficialBusImage, setHasOfficialBusImage] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = getBusImagePath(busName, busBnName);
    const ok = !!p && p !== '/default-bus.svg';
    setOfficialSrc(p);
    setHasOfficialBusImage(ok);
  }, [busName, busBnName]);

  useEffect(() => { trackFeatureUsage('bus_photos'); }, []);

  useEffect(() => {
    setLoading(true);
    getBusPhotos(busId)
      .then(p => setPhotos(p))
      .catch(() => showToast('error', t('community.loadError') || 'Failed to load photos'))
      .finally(() => setLoading(false));
  }, [busId]);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file.');
      return;
    }
    setCompressing(true);
    const compressed = await compressImage(file);
    setPreviewUrl(compressed);
    setCompressing(false);
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
      showToast('success', t('community.photoUploaded') || 'Photo uploaded!');
    } else {
      showToast('error', t('community.submitError') || 'Failed to upload. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('community.busPhotosTitle')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{busName} · {t('community.photosCount', { count: formatNumber(photos.length) })}</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl">
            <Camera className="w-4 h-4" /> {t('community.addPhoto')}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {hasOfficialBusImage && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Bus Image</p>
            <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
              <img
                src={officialSrc || '/default-bus.svg'}
                alt={`${busName} bus`}
                className="w-full max-h-52 object-contain"
                loading="lazy"
                onError={() => { setOfficialSrc('/default-bus.svg'); setHasOfficialBusImage(false); }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              This is the currently available bus image. You can upload newer photos below.
            </p>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t('community.uploadPhotoTitle')}</h3>

            {compressing ? (
              <div className="w-full h-32 border-2 border-dashed border-pink-300 dark:border-pink-700 rounded-xl flex flex-col items-center justify-center gap-2 text-pink-500">
                <span className="w-6 h-6 border-2 border-pink-300 border-t-pink-500 rounded-full animate-spin" />
                <span className="text-sm">{t('community.compressing') || 'Compressing...'}</span>
              </div>
            ) : previewUrl ? (
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
                <span className="text-sm">{t('community.pickPhoto')}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            <input value={caption} onChange={e => setCaption(e.target.value.slice(0, 200))}
              placeholder={t('community.photoCaptionOptional')} maxLength={200}
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white" />

            <div className="flex gap-2">
              <button type="submit" disabled={!previewUrl || submitting || compressing}
                className="flex-1 py-2.5 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2">
                {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('community.submitting')}</> : t('community.submit')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setPreviewUrl(null); setCaption(''); }}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <PhotoSkeleton />
        ) : (
          <>
            {photos.length === 0 && !showForm && !hasOfficialBusImage && (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('community.noPhotosYet')}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('community.beFirstToUpload')}</p>
                {user && (
                  <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-xl">
                    {t('community.addPhoto')}
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {photos.map(p => (
                <button key={p.id} onClick={() => setLightbox(p)} className="relative rounded-2xl overflow-hidden aspect-square">
                  <img src={p.dataUrl} alt={p.caption || busName} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    {p.caption && <p className="text-xs text-white font-medium truncate">{p.caption}</p>}
                    <p className="text-xs text-white/70">{timeAgo(p.timestamp, t, formatNumber)}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
        <div className="h-4" />
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="text-white font-semibold">{lightbox.caption || busName}</p>
              <p className="text-white/60 text-xs">{lightbox.displayName} · {timeAgo(lightbox.timestamp, t, formatNumber)}</p>
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
