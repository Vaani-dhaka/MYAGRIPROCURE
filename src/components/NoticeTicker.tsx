import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronRight, X, Calendar, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Announcement } from '../types/index';

export const NoticeTicker: React.FC = () => {
  const { language, t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => setAnnouncements(data))
      .catch((err) => console.error('Error fetching announcements:', err));
  }, []);

  const latest = announcements[0];

  return (
    <>
      <div className="bg-amber-50 border-b border-amber-200 text-stone-800 text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider shrink-0 shadow-xs">
              <Megaphone className="w-3.5 h-3.5" />
              {t('notice.important')}
            </span>
            <div className="truncate font-medium text-stone-900">
              {latest ? (
                language === 'hi' ? (latest.titleHi || latest.title) : latest.title
              ) : (
                t('notice.defaultText')
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="shrink-0 text-amber-900 hover:text-amber-950 font-semibold underline text-xs flex items-center gap-0.5 ml-2 transition cursor-pointer"
          >
            <span>{t('notice.viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Announcements Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden animate-in fade-in duration-200">
            <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg font-serif">
                  {language === 'hi' ? 'सभी सार्वजनिक सूचनाएँ एवं परिपत्र' : 'Public Notices & Procurement Advisories'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100/80 transition"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                      {ann.category}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {ann.publishedDate}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-base mb-1">
                    {language === 'hi' ? (ann.titleHi || ann.title) : ann.title}
                  </h4>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {language === 'hi' ? (ann.descriptionHi || ann.description) : ann.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 text-right">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded text-sm font-semibold transition"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
