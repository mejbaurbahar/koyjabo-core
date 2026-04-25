import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MessageCircle } from 'lucide-react';
import { getBusRatings, submitBusRating, BusRating, BusRatingSummary, getAuthUser } from '../services/communityDataService';

interface Props {
  busId: string;
  busName: string;
  onBack: () => void;
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return 'এখনই';
  if (diff < 60) return `${diff} মিনিট আগে`;
  if (diff < 1440) return `${Math.floor(diff / 60)} ঘণ্টা আগে`;
  return `${Math.floor(diff / 1440)} দিন আগে`;
}

export default function BusRating({ busId, busName, onBack }: Props) {
  const user = getAuthUser();
  const [summary, setSummary] = useState<BusRatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    getBusRatings(busId).then(d => { setSummary(d); setLoading(false); });
  }, [busId]);

  const myRating = summary?.ratings.find(r => r.userId === user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await submitBusRating(busId, stars, comment);
    if (ok) {
      const fresh = await getBusRatings(busId);
      setSummary(fresh);
      setShowForm(false);
      setComment('');
      setStars(5);
    }
    setSubmitting(false);
  };

  const renderStars = (count: number, size = 'w-5 h-5') =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`${size} ${i < count ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
    ));

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
          <Star className="w-5 h-5 text-white fill-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">বাস রেটিং</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{busName}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl">
          {myRating ? 'পরিবর্তন করুন' : 'রেটিং দিন'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {summary && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-black text-gray-900 dark:text-white">{summary.average.toFixed(1)}</p>
              <div className="flex mt-1">{renderStars(Math.round(summary.average), 'w-4 h-4')}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{summary.count}টি রেটিং</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(s => {
                const cnt = summary.ratings.filter(r => r.stars === s).length;
                const pct = summary.count ? (cnt / summary.count) * 100 : 0;
                return (
                  <div key={s} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-gray-500 dark:text-gray-400">{s}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
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
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">আপনার রেটিং দিন</h3>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} type="button"
                  onMouseEnter={() => setHovered(i + 1)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setStars(i + 1)}>
                  <Star className={`w-8 h-8 transition-colors ${i < (hovered || stars) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)..."
              rows={3}
              className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm dark:text-white resize-none" />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl">
                {submitting ? 'পাঠানো হচ্ছে...' : 'জমা দিন'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold text-sm rounded-xl">
                বাতিল
              </button>
            </div>
          </form>
        )}

        {loading && <div className="text-center py-10 text-gray-400">লোড হচ্ছে...</div>}

        {!loading && (!summary || summary.count === 0) && !showForm && (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">এখনো কোনো রেটিং নেই</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">প্রথম রেটিং দিন!</p>
          </div>
        )}

        {summary?.ratings.map(r => (
          <div key={r.userId + r.timestamp} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{r.displayName || 'ব্যবহারকারী'}</p>
                <div className="flex gap-0.5 mt-0.5">{renderStars(r.stars, 'w-3.5 h-3.5')}</div>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{timeAgo(r.timestamp)}</span>
            </div>
            {r.comment && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{r.comment}</p>}
          </div>
        ))}
        <div className="h-4" />
      </div>
    </div>
  );
}
