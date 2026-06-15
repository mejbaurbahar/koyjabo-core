import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Trash2, Train, ChevronLeft, ChevronRight, X, Upload } from 'lucide-react';
import { getTrainPhotos, deleteTrainPhoto, TrainPhoto, getAuthUser } from '../services/communityDataService';
import { trackFeatureUsage } from '../services/analyticsService';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface Props {
  trainId: string;
  trainName: string;
  onBack: () => void;
}

function timeAgo(ts: number, t: (key: string, params?: Record<string, string | number>) => string, formatNumber: (n: number | string) => string): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return t('history.justNow');
  if (diff < 60) return `${formatNumber(diff)} ${t('history.minutesAgo')}`;
  if (diff < 1440) return `${formatNumber(Math.floor(diff / 60))} ${t('history.hoursAgo')}`;
  return `${formatNumber(Math.floor(diff / 1440))} ${t('history.daysAgo')}`;
}

const CATEGORIES = ['All', 'Exterior', 'Interior', 'Route', 'Other'];

function PhotoSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="aspect-square rounded-xl bg-kj-chip-bg" />
      ))}
    </div>
  );
}

export default function TrainPhotoGallery({ trainId, trainName, onBack }: Props) {
  const user = getAuthUser();
  const { t, formatNumber, language } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [photos, setPhotos] = useState<TrainPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<TrainPhoto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainPhoto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const { showToast } = useToast();

  useEffect(() => { trackFeatureUsage('train_photos'); }, []);

  useEffect(() => {
    setLoading(true);
    getTrainPhotos(trainId)
      .then(p => setPhotos(p))
      .catch(() => showToast(t('community.loadError') || 'Failed to load photos', 'error'))
      .finally(() => setLoading(false));
  }, [trainId]);

  const handleDeletePhoto = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteTrainPhoto(trainId, deleteTarget.id);
    if (ok) {
      const fresh = await getTrainPhotos(trainId);
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
          {lbl('Train Photos', 'ট্রেনের ছবি')}
        </span>
      </div>

      <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto w-full">
        {/* Header card */}
        <div className="dc-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-kj-primary to-kj-neon-violet flex items-center justify-center shrink-0 shadow-lg">
            <Train className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-kj-text text-base truncate">{trainName}</p>
            <p className="text-xs text-kj-text-dim mt-0.5">
              {formatNumber(photos.length)} {lbl('photos', 'ছবি')}
            </p>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-kj-primary to-kj-neon-violet text-white border-transparent shadow'
                  : 'bg-kj-chip-bg text-kj-text-dim border-kj-line hover:border-kj-primary/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photo grid */}
        {loading ? (
          <PhotoSkeleton />
        ) : (
          <>
            {photos.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-kj-primary/10 to-kj-neon-violet/10 border border-kj-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-kj-primary/60" />
                </div>
                <p className="text-kj-text-dim font-semibold">{t('community.noPhotosYet')}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {photos.map(p => (
                <div key={p.id} className="kj-photo relative rounded-xl overflow-hidden aspect-square">
                  <button onClick={() => setLightbox(p)} className="absolute inset-0 w-full h-full">
                    <img src={p.dataUrl} alt={p.caption || trainName} className="w-full h-full object-cover" />
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

        {/* Upload zone placeholder */}
        <div className="dc-card p-4 border-2 border-dashed border-kj-line flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-kj-chip-bg flex items-center justify-center">
            <Upload className="w-5 h-5 text-kj-text-faint" />
          </div>
          <p className="text-sm font-semibold text-kj-text-dim">{lbl('Upload your photo', 'ছবি আপলোড করুন')}</p>
          <p className="text-xs text-kj-text-faint">{lbl('Sign in to contribute train photos', 'ট্রেনের ছবি যোগ করতে সাইন ইন করুন')}</p>
        </div>

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
                <p className="text-white font-semibold text-sm drop-shadow-md">{lightbox.caption || trainName}</p>
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
              <img src={lightbox.dataUrl} alt={lightbox.caption || trainName}
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
