import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, X, Upload, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBusPhotos, submitBusPhoto, deleteBusPhoto, BusPhoto, getAuthUser } from '../services/communityDataService';
import { trackFeatureUsage } from '../services/analyticsService';
import { getBusImagePath } from '../utils/busImageMapper';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

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
    <div className="grid grid-cols-3 gap-2 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="aspect-square rounded-xl bg-kj-chip-bg" />
      ))}
    </div>
  );
}

export default function BusPhotoGallery({ busId, busName, busBnName, onBack }: Props) {
  const user = getAuthUser();
  const { t, formatNumber, language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [photos, setPhotos] = useState<BusPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState<BusPhoto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusPhoto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [officialSrc, setOfficialSrc] = useState<string | null>(null);
  const [hasOfficialBusImage, setHasOfficialBusImage] = useState(false);
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = getBusImagePath(busName, busBnName);
    const ok = !!p && p !== '/default-bus.svg';
    setOfficialSrc(p);
    setHasOfficialBusImage(ok);
  }, [busName, busBnName]);

  useEffect(() => { trackFeatureUsage('bus_photos'); }, []);

  useEffect(() => {
    if (!lightbox && !deleteTarget) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightbox, deleteTarget]);

  useEffect(() => {
    setLoading(true);
    getBusPhotos(busId)
      .then(p => setPhotos(p))
      .catch(() => showToast(t('community.loadError') || 'Failed to load photos', 'error'))
      .finally(() => setLoading(false));
  }, [busId]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
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
      showToast(t('community.photoUploaded') || 'Photo uploaded!', 'success');
    } else {
      showToast(t('community.submitError') || 'Failed to upload. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  const handleDeletePhoto = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteBusPhoto(busId, deleteTarget.id);
    if (ok) {
      const fresh = await getBusPhotos(busId);
      setPhotos(fresh);
      if (lightbox?.id === deleteTarget.id) setLightbox(null);
      showToast(t('community.photoDeleted') || 'Photo deleted.', 'success');
    } else {
      showToast(t('community.submitError') || 'Failed to delete photo. Please try again.', 'error');
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  return (
    <div className="min-h-screen bg-kj-bg text-kj-text overflow-y-auto pb-32">
      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bengali font-bold text-base text-kj-text">
          {lbl('Bus Photos', 'বাসের ছবি')}
        </span>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto w-full">
        {/* Header card */}
        <div className="dc-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shrink-0 shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-kj-text text-base truncate">{busName}</p>
            <p className="text-xs text-kj-text-dim mt-0.5">
              {formatNumber(photos.length)} {lbl('photos', 'ছবি')}
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold shrink-0 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 active:scale-95 transition-all shadow"
            >
              <Camera className="w-3.5 h-3.5" />
              {lbl('Add Photo', 'ছবি যোগ করুন')}
            </button>
          )}
        </div>

        {/* Official bus image */}
        {hasOfficialBusImage && (
          <div className="dc-card p-3">
            <p className="text-[11px] font-bold text-kj-text-faint uppercase tracking-widest mb-2">
              {lbl('Official Image', 'অফিসিয়াল ছবি')}
            </p>
            <div className="rounded-xl overflow-hidden border border-kj-line bg-kj-bg flex items-center justify-center">
              <img
                src={officialSrc || '/default-bus.svg'}
                alt={`${busName} bus`}
                className="w-full max-h-52 object-contain"
                loading="lazy"
                onError={() => { setOfficialSrc('/default-bus.svg'); setHasOfficialBusImage(false); }}
              />
            </div>
            <p className="text-xs text-kj-text-faint mt-2">
              {lbl('Currently available bus image. Upload newer photos below.', 'বর্তমানে পাওয়া বাসের ছবি। নিচে নতুন ছবি আপলোড করুন।')}
            </p>
          </div>
        )}

        {/* Upload form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="dc-card p-4 space-y-3">
            <p className="font-bold text-kj-text text-sm">{t('community.uploadPhotoTitle')}</p>
            {compressing ? (
              <div className="w-full h-32 border-2 border-dashed border-pink-400/40 rounded-xl flex flex-col items-center justify-center gap-2 text-pink-500">
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
                className="w-full h-32 border-2 border-dashed border-kj-line rounded-xl flex flex-col items-center justify-center gap-2 text-kj-text-faint hover:border-pink-400 hover:text-pink-500 transition-colors">
                <Upload className="w-6 h-6" />
                <span className="text-sm">{lbl('Upload your photo', 'ছবি আপলোড করুন')}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <input value={caption} onChange={e => setCaption(e.target.value.slice(0, 200))}
              placeholder={t('community.photoCaptionOptional')} maxLength={200}
              className="w-full bg-kj-chip-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text placeholder:text-kj-text-faint" />
            <div className="flex gap-2">
              <button type="submit" disabled={!previewUrl || submitting || compressing}
                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
                {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('community.submitting')}</> : t('community.submit')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setPreviewUrl(null); setCaption(''); }}
                className="px-4 py-2.5 bg-kj-chip-bg text-kj-text-dim font-semibold text-sm rounded-xl">
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <p className="font-bold text-kj-text text-base">{lbl('Rider photos', 'যাত্রীদের ছবি')}</p>
            <p className="text-xs text-kj-text-faint mt-0.5">
              {formatNumber(photos.length)} {lbl('uploaded photos', 'আপলোড করা ছবি')}
            </p>
          </div>
          {user && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-600 active:scale-95 transition-all"
            >
              {lbl('Add photo', 'ছবি যোগ করুন')}
            </button>
          )}
        </div>

        {/* Photo grid */}
        {loading ? (
          <PhotoSkeleton />
        ) : (
          <>
            {photos.length === 0 && !showForm && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-600/10 border border-pink-500/20 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-pink-500/60" />
                </div>
                <p className="text-kj-text-dim font-semibold">{t('community.noPhotosYet')}</p>
                <p className="text-sm text-kj-text-faint mt-1">{t('community.beFirstToUpload')}</p>
                {user && (
                  <button onClick={() => setShowForm(true)}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-bold rounded-xl active:scale-95 transition-all">
                    {lbl('Add Photo', 'ছবি যোগ করুন')}
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {user && !showForm && photos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="aspect-square rounded-2xl border-2 border-dashed border-kj-line bg-kj-panel/80 flex flex-col items-center justify-center gap-2 text-kj-text-faint hover:border-pink-400 hover:text-pink-500 transition-colors"
                >
                  <Upload className="w-7 h-7" />
                  <span className="text-xs font-bold">{lbl('Upload photo', 'ছবি আপলোড')}</span>
                </button>
              )}
              {photos.map(p => (
                <div key={p.id} className="kj-photo relative rounded-2xl overflow-hidden aspect-square border border-kj-line bg-kj-panel">
                  <button onClick={() => setLightbox(p)} className="absolute inset-0 w-full h-full">
                    <img src={p.dataUrl} alt={p.caption || busName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      {p.caption && <p className="text-[10px] text-white font-medium truncate">{p.caption}</p>}
                      <p className="text-[10px] text-white/70">{timeAgo(p.timestamp, t, formatNumber)}</p>
                    </div>
                  </button>
                  {user && p.userId === user.id && (
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(p); }}
                      className="kj-photo-del absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center z-10 opacity-0 transition-opacity"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Upload zone for unauthenticated — shown as placeholder */}
        {!user && (
          <div className="dc-card p-4 border-2 border-dashed border-kj-line flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-kj-chip-bg flex items-center justify-center">
              <Upload className="w-5 h-5 text-kj-text-faint" />
            </div>
            <p className="text-sm font-semibold text-kj-text-dim">{lbl('Upload your photo', 'ছবি আপলোড করুন')}</p>
            <p className="text-xs text-kj-text-faint">{lbl('Sign in to contribute photos', 'ছবি যোগ করতে সাইন ইন করুন')}</p>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Lightbox */}
      {lightbox && (() => {
        const currentIndex = photos.findIndex(p => p.id === lightbox.id);
        const hasPrev = currentIndex > 0;
        const hasNext = currentIndex < photos.length - 1;
        return (
          <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between bg-gradient-to-b from-black/60 to-transparent z-10">
              <div className="flex-1 pr-4">
                <p className="text-white font-semibold text-sm drop-shadow-md">{lightbox.caption || busName}</p>
                <p className="text-white/70 text-xs mt-1 drop-shadow-md">{lightbox.displayName} · {timeAgo(lightbox.timestamp, t, formatNumber)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user && lightbox.userId === user.id && (
                  <button onClick={() => { setDeleteTarget(lightbox); setLightbox(null); }}
                    className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-transform active:scale-95">
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                )}
                <button onClick={() => setLightbox(null)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
              <img src={lightbox.dataUrl} alt={lightbox.caption || busName}
                className="max-w-full max-h-full object-contain rounded-lg select-none" />
            </div>
            {hasPrev && (
              <button onClick={e => { e.stopPropagation(); setLightbox(photos[currentIndex - 1]); }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 z-10">
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            {hasNext && (
              <button onClick={e => { e.stopPropagation(); setLightbox(photos[currentIndex + 1]); }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 z-10">
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>
        );
      })()}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm dc-card p-5">
            <h3 className="text-base font-bold text-kj-text mb-2">{t('community.deletePhotoTitle') || 'Delete Photo?'}</h3>
            <p className="text-sm text-kj-text-dim mb-4">{t('community.deletePhotoDesc') || 'This will permanently remove your photo. This action cannot be undone.'}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="px-4 py-2 rounded-xl bg-kj-chip-bg text-kj-text-dim text-sm font-semibold disabled:opacity-50">
                {lbl('Cancel', 'বাতিল')}
              </button>
              <button onClick={handleDeletePhoto} disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-50 flex items-center gap-2 active:scale-95 transition-all">
                {deleting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {deleting ? lbl('Deleting…', 'মুছছে…') : lbl('Delete', 'মুছুন')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
