import React, { useEffect, useState } from 'react';
import { ArrowLeft, Star, Train, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { getAuthUser, getTrainRatings, submitTrainRating, deleteTrainRating, TrainRatingSummary } from '../services/communityDataService';
import { trackFeatureUsage } from '../services/analyticsService';

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

function RatingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 flex items-center gap-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg mx-auto" />
          <div className="flex gap-1 justify-center">{Array.from({ length: 5 }, (_, i) => <div key={i} className="w-4 h-4 bg-gray-200 dark:bg-slate-700 rounded" />)}</div>
          <div className="w-16 h-3 bg-gray-200 dark:bg-slate-700 rounded mx-auto" />
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full" />
              <div className="w-4 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-2">
          <div className="flex justify-between">
            <div className="space-y-1">
              <div className="w-24 h-3.5 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="flex gap-1">{Array.from({ length: 5 }, (_, j) => <div key={j} className="w-3 h-3 bg-gray-200 dark:bg-slate-700 rounded" />)}</div>
            </div>
            <div className="w-16 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="w-3/4 h-3 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function TrainRating({ trainId, trainName, onBack }: Props) {
  const user = getAuthUser();
  const { t, formatNumber } = useLanguage();
  const [summary, setSummary] = useState<TrainRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { trackFeatureUsage('train_rating'); }, []);

  useEffect(() => {
    setLoading(true);
    getTrainRatings(trainId)
      .then(d => setSummary(d))
      .catch(() => showToast(t('community.loadError') || 'Failed to load ratings', 'error'))
      .finally(() => setLoading(false));
  }, [trainId]);

  const myRating = summary?.ratings.find(r => r.userId === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await submitTrainRating(trainId, trainName, stars, comment);
    if (ok) {
      const fresh = await getTrainRatings(trainId);
      setSummary(fresh);
      setShowForm(false);
      setComment('');
      setStars(5);
      showToast(t('community.ratingSubmitted') || 'Rating saved!', 'success');
    } else {
      showToast(t('community.submitError') || 'Failed to save. Please try again.', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    const ok = await deleteTrainRating(trainId);
    if (ok) {
      const fresh = await getTrainRatings(trainId);
      setSummary(fresh);
      setShowForm(false);
      setComment('');
      setStars(5);
      showToast(t('community.ratingDeleted') || 'Rating removed.', 'success');
    } else {
      showToast(t('community.submitError') || 'Failed. Please try again.', 'error');
    }
    setShowDeleteModal(false);
    setSubmitting(false);
  };

  const handleOpenForm = () => {
    if (myRating) { setStars(myRating.stars); setComment((myRating.comment || '').trim()); }
    else { setStars(5); setComment(''); }
    setShowForm(v => !v);
  };

  const renderStars = (count: number, size = 'w-5 h-5') =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${size} ${i < count ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
    ));

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Train className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('community.trainRatingTitle')}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{trainName}</p>
        </div>
        {user && (
          <button onClick={handleOpenForm}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl">
            {myRating ? t('community.editRating') : t('community.rateNow')}
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y p-4 space-y-4 pb-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <RatingSkeleton />
        ) : (
          <>
            {summary && summary.count > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-black text-gray-900 dark:text-white">{summary.average.toFixed(1)}</p>
                  <div className="flex mt-1">{renderStars(Math.round(summary.average), 'w-4 h-4')}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('community.ratingsCount', { count: formatNumber(summary.count) })}</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map(s => {
                    const cnt = summary.ratings.filter(r => r.stars === s).length;
                    const pct = summary.count ? (cnt / summary.count) * 100 : 0;
                    return (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-gray-500 dark:text-gray-400">{s}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-5 text-gray-500 dark:text-gray-400 text-right">{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t('community.giveYourRating')}</h3>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button key={i} type="button"
                      onMouseEnter={() => setHovered(i + 1)} onMouseLeave={() => setHovered(0)}
                      onClick={() => setStars(i + 1)}>
                      <Star className={`w-8 h-8 transition-colors ${i < (hovered || stars) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                    </button>
                  ))}
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value.slice(0, 500))}
                  placeholder={t('community.writeExperienceOptional')} rows={3} maxLength={500}
                  className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white resize-none" />
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2">
                    {submitting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('community.submitting')}</> : t('community.submit')}
                  </button>
                  {myRating && (
                    <button type="button" onClick={() => setShowDeleteModal(true)} disabled={submitting}
                      className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold text-sm rounded-xl disabled:opacity-50">
                      {t('community.deleteRating')}
                    </button>
                  )}
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            )}

            {(!summary || summary.count === 0) && !showForm && (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">{t('community.noRatingsYet')}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('community.beFirstToRate')}</p>
                {user && (
                  <button onClick={handleOpenForm} className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl">
                    {t('community.rateNow')}
                  </button>
                )}
              </div>
            )}

            {summary?.ratings.map(r => (
              <div key={r.userId + r.timestamp} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(r.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.displayName || 'User'}</p>
                      <div className="flex gap-0.5 mt-0.5">{renderStars(r.stars, 'w-3.5 h-3.5')}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{timeAgo(r.timestamp, t, formatNumber)}</span>
                </div>
                {r.comment?.trim() && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 pl-10">{r.comment.trim()}</p>}
              </div>
            ))}
          </>
        )}
        <div className="h-4" />
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{t('community.deleteRating')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{t('community.confirmDeleteRating')}</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm font-semibold">
                {t('common.cancel')}
              </button>
              <button onClick={handleDelete} disabled={submitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {submitting ? t('community.submitting') : t('community.deleteRating')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
