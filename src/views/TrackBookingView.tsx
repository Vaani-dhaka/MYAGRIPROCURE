import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Scale,
  Truck,
  Printer,
  AlertCircle,
  QrCode,
  Sparkles,
  Users,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { Booking } from '../types/index.js';

interface TrackBookingViewProps {
  initialToken?: string;
}

export const TrackBookingView: React.FC<TrackBookingViewProps> = ({ initialToken }) => {
  const { language, t } = useLanguage();

  const [tokenInput, setTokenInput] = useState<string>(initialToken || 'PX-001');
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (tokenToTrack: string) => {
    if (!tokenToTrack.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/track/${encodeURIComponent(tokenToTrack.trim())}`);
      if (!res.ok) {
        throw new Error(t('track.notFound'));
      }
      const data = await res.json();
      setBooking(data);
    } catch (err: any) {
      setBooking(null);
      setError(err.message || 'Error tracking booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenInput) {
      fetchStatus(tokenInput);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Quick demo tokens
  const sampleTokens = ['PX-001', 'PX-002', 'PX-003', 'PX-004'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. HEADER */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 mb-1">
          <Activity className="w-6 h-6 text-blue-700" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
          {t('track.title')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          {t('track.subtitle')}
        </p>
      </div>

      {/* 2. SEARCH BOX */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchStatus(tokenInput);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              id="track-token-input"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              placeholder={t('track.inputPlaceholder')}
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-4" />
          </div>

          <button
            type="submit"
            id="track-submit-btn"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-amber-300" />
            <span>{loading ? t('common.loading') : t('track.button')}</span>
          </button>
        </form>

        {/* Quick Sample Tokens */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-stone-500">
          <span className="font-medium">Try Demo Tokens:</span>
          {sampleTokens.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setTokenInput(st);
                fetchStatus(st);
              }}
              className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 font-mono text-[11px] text-stone-700 transition"
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. ERROR OR RESULTS */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {booking && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md overflow-hidden space-y-6">
          {/* Top Token Strip */}
          <div className="bg-emerald-900 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold block">
                Booking Reference Token
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-300">
                {booking.bookingToken}
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                Farmer: <strong className="text-white">{booking.farmerName}</strong> ({booking.farmerPhone})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  booking.status === 'COMPLETED'
                    ? 'bg-emerald-500 text-white'
                    : booking.status === 'IN_PROGRESS'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : booking.status === 'WAITING'
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {booking.status}
              </span>

              <button
                type="button"
                onClick={handlePrint}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition text-xs flex items-center gap-1.5"
                title="Print Slip"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print Slip</span>
              </button>
            </div>
          </div>

          {/* Dynamic Queue Status Banner */}
          <div className="px-5 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-bold uppercase block">
                  Current Serving Token
                </span>
                <span className="text-xl font-black font-mono text-emerald-950">
                  {booking.servingToken || 'PX-001'}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">At Electronic Weighbridge 1</span>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[11px] text-amber-800 font-bold uppercase block">
                  Farmers Ahead in Queue
                </span>
                <span className="text-xl font-black font-mono text-amber-950">
                  {booking.peopleAhead || 0}
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Farmers in queue</span>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[11px] text-blue-800 font-bold uppercase block">
                  Estimated Wait Time
                </span>
                <span className="text-xl font-black font-mono text-blue-950">
                  ~{booking.estimatedWaitMinutes || 15} Mins
                </span>
                <span className="text-[10px] text-blue-700 block mt-0.5">Average turn-around</span>
              </div>
            </div>
          </div>

          {/* Process Timeline */}
          <div className="px-5 sm:px-6 py-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">
              Procurement Process Timeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
              {/* Step 1 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('track.stepConfirmed')}</span>
                </div>
                <p className="text-[11px] text-stone-600">Slot booked & token verified.</p>
              </div>

              {/* Step 2 */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  booking.status === 'WAITING' || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED'
                    ? 'bg-stone-50 border-emerald-300'
                    : 'bg-stone-100/50 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{t('track.stepWaiting')}</span>
                </div>
                <p className="text-[11px] text-stone-600">Farmer currently in queue at the entry gate.</p>
              </div>

              {/* Step 3 */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED'
                    ? 'bg-stone-50 border-emerald-300'
                    : 'bg-stone-100/50 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>{t('track.stepInProgress')}</span>
                </div>
                <p className="text-[11px] text-stone-600">Moisture grading & weighing.</p>
              </div>

              {/* Step 4 */}
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  booking.status === 'COMPLETED'
                    ? 'bg-emerald-50 border-emerald-400'
                    : 'bg-stone-100/50 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-1.5 text-stone-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('track.stepCompleted')}</span>
                </div>
                <p className="text-[11px] text-stone-600">Receipt issued & DBT credited.</p>
              </div>
            </div>
          </div>

          {/* Booking Info Grid */}
          <div className="px-5 sm:px-6 pb-6">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Centre:</span>
                <span className="font-bold text-stone-900">{booking.centreName}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Scheduled Date:</span>
                <span className="font-bold text-stone-900">{booking.date}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Time Slot:</span>
                <span className="font-bold text-stone-900">{booking.timeSlot}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Crop & Quantity:</span>
                <span className="font-bold text-emerald-800">
                  {booking.cropType} ({booking.estimatedWeightQuintal} Qtl)
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Vehicle No:</span>
                <span className="font-mono font-bold text-stone-900">{booking.vehicleNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">District & State:</span>
                <span className="font-bold text-stone-900">{booking.district}, {booking.state}</span>
              </div>
              <div className="col-span-2">
                <span className="text-stone-500 block">Special Remarks:</span>
                <span className="text-stone-800">{booking.notes || 'Moisture pre-tested, Standard packaging.'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
