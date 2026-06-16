import SponsoredAdSlot from './SponsoredAdSlot';
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Star, Train } from 'lucide-react';
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

const ASPECT_LABELS = [
  { key: 'ontime',  en: 'On-time',       bn: 'সময়মতো' },
  { key: 'clean',   en: 'Cleanliness',   bn: 'পরিষ্কার' },
  { key: 'comfort', en: 'Comfort',        bn: 'আরামদায়ক' },
  { key: 'staff',   en: 'Staff behavior', bn: 'কর্মীর ব্যবহার' },
  { key: 'safety',  en: 'Safety',         bn: 'নিরাপত্তা' },
];

const TAGS = [
  { emoji: '✨', en: 'Clean', bn: 'পরিষ্কার' },
  { emoji: '🕐', en: 'On time', bn: 'সময়মতো' },
  { emoji: '🛋️', en: 'Comfortable', bn: 'আরামদায়ক' },
  { emoji: '😊', en: 'Friendly staff', bn: 'ভালো কর্মী' },
  { emoji: '🔇', en: 'Quiet ride', bn: 'শান্ত যাত্রা' },
  { emoji: '💰', en: 'Good value', bn: 'দাম ঠিক' },
];

const STAR_LABELS = ['', 'খুব খারাপ / Very bad', 'খারাপ / Bad', 'ঠিকঠাক / Okay', 'ভালো / Good', 'খুব ভালো / Very good'];

function RatingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse px-4 pt-4">
      <div className="dc-card rounded-2xl p-5 flex items-center gap-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-12 bg-kj-chip-bg rounded-lg mx-auto" />
          <div className="flex gap-1 justify-center">{Array.from({ length: 5 }, (_, i) => <div key={i} className="w-4 h-4 bg-kj-chip-bg rounded" />)}</div>
          <div className="w-16 h-3 bg-kj-chip-bg rounded mx-auto" />
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-kj-chip-bg rounded" />
              <div className="flex-1 h-2 bg-kj-chip-bg rounded-full" />
              <div className="w-4 h-3 bg-kj-chip-bg rounded" />
            </div>
          ))}
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="dc-card rounded-2xl p-4 space-y-2">
          <div className="flex justify-between">
            <div className="space-y-1">
              <div className="w-24 h-3.5 bg-kj-chip-bg rounded" />
              <div className="flex gap-1">{Array.from({ length: 5 }, (_, j) => <div key={j} className="w-3 h-3 bg-kj-chip-bg rounded" />)}</div>
            </div>
            <div className="w-16 h-3 bg-kj-chip-bg rounded" />
          </div>
          <div className="w-full h-3 bg-kj-chip-bg rounded" />
          <div className="w-3/4 h-3 bg-kj-chip-bg rounded" />
        </div>
      ))}
    </div>
  );
}

export default function TrainRating({ trainId, trainName, onBack }: Props) {
  const user = getAuthUser();
  const { t, language, formatNumber } = useLanguage();
  const lbl = (en: string, bn: string) => language === 'bn' ? bn : en;
  const [summary, setSummary] = useState<TrainRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stars, setStars] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [aspectStars, setAspectStars] = useState<Record<string, number>>({});
  const [aspectHovered, setAspectHovered] = useState<Record<string, number>>({});
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
    const tagString = activeTags.join(', ');
    const fullComment = [comment.trim(), tagString].filter(Boolean).join(' · ');
    const ok = await submitTrainRating(trainId, trainName, stars, fullComment);
    if (ok) {
      const fresh = await getTrainRatings(trainId);
      setSummary(fresh);
      setShowForm(false);
      setComment('');
      setStars(5);
      setActiveTags([]);
      setAspectStars({});
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
      setActiveTags([]);
      setAspectStars({});
      showToast(t('community.ratingDeleted') || 'Rating removed.', 'success');
    } else {
      showToast(t('community.submitError') || 'Failed. Please try again.', 'error');
    }
    setShowDeleteModal(false);
    setSubmitting(false);
  };

  const handleOpenForm = () => {
    if (myRating) { setStars(myRating.stars); setComment((myRating.comment || '').trim()); }
    else { setStars(5); setComment(''); setActiveTags([]); setAspectStars({}); }
    setShowForm(v => !v);
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const renderMiniStars = (count: number, size = 'w-3.5 h-3.5') =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${size} ${i < count ? 'text-amber-400 fill-amber-400' : 'text-kj-text-faint'}`} />
    ));

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-kj-bg overflow-hidden">

      {/* Sticky back bar */}
      <div className="sticky top-0 z-20 bg-kj-bg/90 backdrop-blur-md border-b border-kj-line flex items-center gap-3 px-4 py-3 shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-kj-line bg-kj-panel text-kj-text-dim flex items-center justify-center active:scale-90 transition-all hover:border-kj-primary/40 hover:text-kj-primary"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bengali font-bold text-base text-kj-text flex-1">
          {lbl('Rate & Review', 'রেট ও রিভিউ')}
        </span>
        {user && (
          <button
            onClick={handleOpenForm}
            className="px-3 py-1.5 rounded-xl text-xs font-bold font-bengali text-kj-primary-ink active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))', boxShadow: '0 4px 12px -4px var(--kj-primary)' }}
          >
            {myRating ? lbl('Edit rating', 'রেটিং সম্পাদনা') : lbl('Rate now', 'রেট করুন')}
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y pb-8" style={{ WebkitOverflowScrolling: 'touch' }}>
        {loading ? (
          <RatingSkeleton />
        ) : (
          <div className="px-4 pt-4 space-y-4 max-w-2xl mx-auto w-full">

            {/* Subject card */}
            <div className="dc-card rounded-2xl p-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-neon-violet, #7c3aed))' }}
              >
                <Train className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bengali font-bold text-kj-text text-base truncate">{trainName}</p>
                <p className="text-[11px] text-kj-text-faint font-sans mt-0.5">
                  {lbl('Rate & review this train service', 'এই ট্রেন সার্ভিসটি রেট ও রিভিউ করুন')}
                </p>
              </div>
            </div>

            {/* Overall rating summary */}
            {summary && summary.count > 0 && (
              <div className="dc-card rounded-2xl p-5 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-5xl font-black text-kj-text">{summary.average.toFixed(1)}</p>
                  <div className="flex mt-1 justify-center">{renderMiniStars(Math.round(summary.average), 'w-4 h-4')}</div>
                  <p className="text-xs text-kj-text-dim mt-1 font-bengali">{t('community.ratingsCount', { count: formatNumber(summary.count) })}</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(s => {
                    const cnt = summary.ratings.filter(r => r.stars === s).length;
                    const pct = summary.count ? (cnt / summary.count) * 100 : 0;
                    return (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <span className="w-3 font-sans text-kj-text-dim">{s}</span>
                        <div className="flex-1 bg-kj-chip-bg rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-4 font-sans text-kj-text-dim text-right">{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rating form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Overall star picker */}
                <div className="dc-card rounded-2xl p-5 flex flex-col items-center gap-3">
                  <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
                    {lbl('Overall rating', 'সামগ্রিক রেটিং')}
                  </p>
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHovered(i + 1)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setStars(i + 1)}
                        className="active:scale-90 transition-transform"
                      >
                        <Star
                          className={`w-9 h-9 transition-colors ${i < (hovered || stars) ? 'text-amber-400 fill-amber-400' : 'text-kj-text-faint'}`}
                        />
                      </button>
                    ))}
                  </div>
                  {(hovered || stars) > 0 && (
                    <p className="text-xs font-bold font-bengali" style={{ color: 'var(--kj-amber)' }}>
                      ★ {hovered || stars} · {STAR_LABELS[hovered || stars]}
                    </p>
                  )}
                </div>

                {/* Aspect ratings */}
                <div className="dc-card rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
                    {lbl('Rate aspects', 'বিস্তারিত রেট')}
                  </p>
                  {ASPECT_LABELS.map(a => (
                    <div key={a.key} className="flex items-center gap-3">
                      <span className="flex-1 text-sm font-bengali text-kj-text">{lbl(a.en, a.bn)}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            onMouseEnter={() => setAspectHovered(prev => ({ ...prev, [a.key]: i + 1 }))}
                            onMouseLeave={() => setAspectHovered(prev => ({ ...prev, [a.key]: 0 }))}
                            onClick={() => setAspectStars(prev => ({ ...prev, [a.key]: i + 1 }))}
                            className="active:scale-90 transition-transform"
                          >
                            <Star
                              className={`w-4 h-4 transition-colors ${i < (aspectHovered[a.key] || aspectStars[a.key] || 0) ? 'text-amber-400 fill-amber-400' : 'text-kj-text-faint'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="dc-card rounded-2xl p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-kj-text-faint font-sans">
                    {lbl('What stood out?', 'কী ভালো লেগেছে?')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map(tag => {
                      const label = lbl(tag.en, tag.bn);
                      const active = activeTags.includes(label);
                      return (
                        <button
                          key={tag.en}
                          type="button"
                          onClick={() => toggleTag(label)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-bengali border transition-all active:scale-95 ${
                            active
                              ? 'text-kj-primary-ink border-transparent'
                              : 'bg-kj-chip-bg text-kj-text border-kj-line hover:border-kj-primary/40'
                          }`}
                          style={active ? {
                            background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))',
                            boxShadow: '0 2px 8px -2px var(--kj-primary)',
                          } : undefined}
                        >
                          <span>{tag.emoji}</span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review text */}
                <div className="dc-card rounded-2xl p-4 space-y-3">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value.slice(0, 500))}
                    placeholder={lbl('Share your experience (optional)...', 'আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)...')}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-kj-input-bg border border-kj-line rounded-xl px-3 py-2.5 text-sm text-kj-text placeholder:text-kj-text-faint resize-none focus:outline-none focus:border-kj-primary/40 font-bengali"
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] font-sans text-kj-text-faint">{comment.length}/500</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 bg-kj-chip-bg text-kj-text-dim font-semibold text-sm rounded-xl font-bengali"
                  >
                    {lbl('Cancel', 'বাতিল')}
                  </button>
                  {myRating && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={submitting}
                      className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 font-semibold text-sm rounded-xl disabled:opacity-50 font-bengali"
                    >
                      {lbl('Delete', 'মুছুন')}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-kj-primary-ink font-bengali active:scale-[0.98] transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))', boxShadow: '0 6px 16px -6px var(--kj-primary)' }}
                  >
                    {submitting
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{lbl('Posting...', 'পোস্ট হচ্ছে...')}</>
                      : lbl('Post Review', 'রিভিউ পোস্ট করুন')}
                  </button>
                </div>
              </form>
            )}

            {/* Empty state */}
            {(!summary || summary.count === 0) && !showForm && (
              <div className="dc-card rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, var(--kj-primary-soft), var(--kj-neon-violet, #7c3aed)22)' }}
                >
                  <Train className="w-8 h-8 text-kj-primary" />
                </div>
                <p className="font-bengali font-bold text-kj-text">{t('community.noRatingsYet')}</p>
                <p className="text-sm text-kj-text-faint font-bengali">{t('community.beFirstToRate')}</p>
                {user && (
                  <button
                    onClick={handleOpenForm}
                    className="mt-1 px-5 py-2.5 rounded-xl text-sm font-bold font-bengali text-kj-primary-ink active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-primary-deep))', boxShadow: '0 4px 12px -4px var(--kj-primary)' }}
                  >
                    {lbl('Rate now', 'রেট করুন')}
                  </button>
                )}
              </div>
            )}

            {/* Review list */}
            {summary?.ratings.map(r => (
              <div key={r.userId + r.timestamp} className="dc-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 font-sans"
                      style={{ background: 'linear-gradient(135deg, var(--kj-primary), var(--kj-neon-violet, #7c3aed))' }}
                    >
                      {(r.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-kj-text text-sm font-bengali">{r.displayName || 'User'}</p>
                        {r.userId === user?.id && (
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded font-sans"
                            style={{ background: 'var(--kj-primary-soft)', color: 'var(--kj-primary)' }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex gap-0.5 mt-0.5">{renderMiniStars(r.stars, 'w-3.5 h-3.5')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-kj-text-faint font-sans">{timeAgo(r.timestamp, t, formatNumber)}</span>
                    {r.userId === user?.id && (
                      <button
                        onClick={handleOpenForm}
                        className="w-7 h-7 rounded-lg bg-kj-chip-bg flex items-center justify-center text-kj-text-dim hover:text-kj-primary transition-colors text-sm"
                      >
                        ⋯
                      </button>
                    )}
                  </div>
                </div>
                {r.comment?.trim() && (
                  <p className="text-sm text-kj-text-dim mt-2.5 pl-10 font-bengali leading-relaxed">{r.comment.trim()}</p>
                )}
                <div className="flex items-center gap-2 mt-3 pl-10">
                  <button className="text-[11px] text-kj-text-faint hover:text-kj-primary font-semibold font-bengali transition-colors">
                    {lbl('👍 Helpful', '👍 সহায়ক')}
                  </button>
                </div>
              </div>
            ))}

            <div className="h-4" />
          </div>
        )}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-kj-panel rounded-2xl border border-kj-line p-5 shadow-2xl">
            <h3 className="text-base font-bold text-kj-text mb-2 font-bengali">{t('community.deleteRating')}</h3>
            <p className="text-sm text-kj-text-dim mb-4 font-bengali">{t('community.confirmDeleteRating')}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-kj-chip-bg text-kj-text-dim text-sm font-semibold font-bengali"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2 font-bengali"
              >
                {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {submitting ? lbl('Deleting...', 'মুছছে...') : t('community.deleteRating')}
              </button>
            </div>
          </div>
        </div>
      )}
    
        <SponsoredAdSlot language={language as 'en' | 'bn'} size="300x250" compact />
</div>
  );
}
