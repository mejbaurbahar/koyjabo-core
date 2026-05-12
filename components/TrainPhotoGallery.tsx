import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, Trash2, Train, ChevronLeft, ChevronRight, X } from 'lucide-react';
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



function PhotoSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="aspect-square rounded-2xl bg-gray-200 dark:bg-slate-700" />
      ))}
    </div>
  );
}

export default function TrainPhotoGallery({ trainId, trainName, onBack }: Props) {
  const user = getAuthUser();
  const { t, formatNumber } = useLanguage();
  const [photos, setPhotos] = useState<TrainPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<TrainPhoto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainPhoto | null>(null);
  const [deleting, setDeleting] = useState(false);
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
    <div className="flex flex-col flex-1 min-h-0 bg-kj-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-kj-panel border-b border-kj-line shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-kj-chip-bg dark:hover:bg-kj-chip-bg rounded-full">
          <ArrowLeft className="w-5 h-5 text-kj-text-dim" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Train className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-kj-text">Train Photos</h1>
          <p className="text-xs text-kj-text-dim">{trainName} · {formatNumber(photos.length)} photos</p>
        </div>

      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-4 space-y-3 pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>


        {loading ? (
          <PhotoSkeleton />
        ) : (
          <>
            {photos.length === 0 && (
              <div className="text-center py-12">
                <Camera className="w-12 h-12 text-kj-text-faint mx-auto mb-3" />
                <p className="text-kj-text-dim font-medium">{t('community.noPhotosYet')}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {photos.map(p => (
                <div key={p.id} className="relative rounded-2xl overflow-hidden aspect-square">
                  <button onClick={() => setLightbox(p)} className="absolute inset-0 w-full h-full">
                    <img src={p.dataUrl} alt={p.caption || trainName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      {p.caption && <p className="text-xs text-white font-medium truncate">{p.caption}</p>}
                      <p className="text-xs text-white/70">{timeAgo(p.timestamp, t, formatNumber)}</p>
                    </div>
                  </button>
                  {user && p.userId === user.id && (
                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(p); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center z-10"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
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
            {/* Top Bar / Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between bg-gradient-to-b from-black/60 to-transparent z-10">
              <div className="flex-1 pr-4">
                <p className="text-white font-semibold text-sm md:text-base drop-shadow-md">{lightbox.caption || trainName}</p>
                <p className="text-white/80 text-xs mt-1 drop-shadow-md">{lightbox.displayName} · {timeAgo(lightbox.timestamp, t, formatNumber)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {user && lightbox.userId === user.id && (
                  <button
                    onClick={() => { setDeleteTarget(lightbox); setLightbox(null); }}
                    className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-transform active:scale-95 shadow-lg"
                    title="Delete photo"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                )}
                <button 
                  onClick={() => setLightbox(null)} 
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 shadow-lg"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
              <img 
                src={lightbox.dataUrl} 
                alt={lightbox.caption || trainName} 
                className="max-w-full max-h-full object-contain rounded-lg select-none" 
              />
            </div>

            {/* Navigation Arrows */}
            {hasPrev && (
              <button 
                onClick={(e) => { e.stopPropagation(); setLightbox(photos[currentIndex - 1]); }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            {hasNext && (
              <button 
                onClick={(e) => { e.stopPropagation(); setLightbox(photos[currentIndex + 1]); }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>
        );
      })()}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm bg-kj-panel rounded-2xl border border-kj-line p-5 shadow-2xl">
            <h3 className="text-base font-bold text-kj-text mb-2">{t('community.deletePhotoTitle') || 'Delete Photo?'}</h3>
            <p className="text-sm text-kj-text-dim mb-4">{t('community.deletePhotoDesc') || 'This will permanently remove your photo. This action cannot be undone.'}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="px-4 py-2 rounded-xl bg-kj-chip-bg text-kj-text-dim text-sm font-semibold disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDeletePhoto} disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {deleting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
