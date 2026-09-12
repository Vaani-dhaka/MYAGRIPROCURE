import React, { useEffect, useMemo, useState } from 'react';
import { X, Calendar, Clock, Truck, Scale, CheckCircle, Printer, AlertTriangle, Building2, QrCode, Sparkles, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import { Centre, Booking } from '../types/index.js';
import { sortCentres } from '../utils/centreUtils.js';
import { CentrePicker } from './CentrePicker.js';

interface BookingModalProps {
  centre: Centre | null;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ centre, onClose, onBookingSuccess }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];
  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState(centre?.id || user?.preferredCentreId || '');
  const [loadingCentres, setLoadingCentres] = useState(true);
  const [date, setDate] = useState(todayStr);
  const [timeSlot, setTimeSlot] = useState('Morning (08:30 AM - 11:30 AM)');
  const [cropType, setCropType] = useState(centre?.cropsHandled?.[0] || 'Wheat');
  const [estimatedWeightQuintal, setEstimatedWeightQuintal] = useState(40);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const loadCentres = async () => {
    setLoadingCentres(true);
    setError(null);
    try {
      const res = await fetch('/api/centres');
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) throw new Error(data?.error || 'Unable to load procurement centres');
      setCentres(sortCentres(data));
    } catch (err: any) {
      setError(err.message || 'Unable to load procurement centres.');
    } finally {
      setLoadingCentres(false);
    }
  };

  useEffect(() => { loadCentres(); }, []);

  const allowedCentres = useMemo(() => {
    const state = user?.state?.trim().toLowerCase();
    const district = user?.district?.trim().toLowerCase();
    if (!state || !district) return centres;
    return centres.filter((c) => c.state.trim().toLowerCase() === state && c.district.trim().toLowerCase() === district);
  }, [centres, user?.state, user?.district]);

  useEffect(() => {
    if (!allowedCentres.length) return;
    const preferred = allowedCentres.find((c) => c.id === user?.preferredCentreId);
    const requested = allowedCentres.find((c) => c.id === centre?.id);
    const current = allowedCentres.find((c) => c.id === selectedCentreId);
    const next = current || requested || preferred || allowedCentres[0];
    if (next) {
      setSelectedCentreId(next.id);
      setCropType((old) => next.cropsHandled.includes(old) ? old : (next.cropsHandled[0] || 'Wheat'));
    }
  }, [allowedCentres, centre?.id, user?.preferredCentreId, selectedCentreId]);

  const selectedCentre = allowedCentres.find((c) => c.id === selectedCentreId) || null;

  const handleCentreChange = (id: string) => {
    const next = allowedCentres.find((c) => c.id === id);
    setSelectedCentreId(id);
    setError(null);
    if (next) setCropType(next.cropsHandled[0] || 'Wheat');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'FARMER') return setError('Only farmers can create procurement bookings.');
    if (!selectedCentre) return setError('Please select a procurement centre.');
    if (selectedCentre.status === 'CLOSED' || selectedCentre.status === 'FULL' || selectedCentre.availableSlots <= 0) return setError('This centre currently has no available slots.');

    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('paradox_token');
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ centreId: selectedCentre.id, date, timeSlot, cropType, estimatedWeightQuintal, vehicleNumber: vehicleNumber.trim(), notes: notes.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to reserve slot');
      setCreatedBooking(data);
      onBookingSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/65 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-stone-200 overflow-visible my-6">
        <div className="bg-emerald-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-bold text-lg leading-tight font-serif">{createdBooking ? t('booking.bookingSuccess') : t('booking.modalTitle')}</h3>
              <p className="text-xs text-emerald-200 truncate">{selectedCentre ? `${selectedCentre.name} • ${selectedCentre.district}, ${selectedCentre.state}` : 'Select a procurement centre'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 sm:p-6">
          {createdBooking ? (
            <div className="space-y-4">
              <div className="text-center py-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2"><CheckCircle className="w-7 h-7" /></div>
                <h4 className="text-xl font-black text-emerald-950 font-serif">{language === 'hi' ? 'खरीद स्लॉट टोकन जारी!' : 'Procurement Token Generated!'}</h4>
                <p className="text-xs text-stone-600 mt-0.5">{t('booking.tokenInstructions')}</p>
              </div>
              <div className="p-5 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 space-y-4">
                <div className="flex items-start justify-between"><div><span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Booking Token Number</span><div className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono mt-0.5">{createdBooking.bookingToken}</div></div><QrCode className="w-12 h-12 text-stone-800" /></div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-200 text-xs">
                  <div><span className="text-stone-500 block">Farmer Name:</span><b>{createdBooking.farmerName}</b></div>
                  <div><span className="text-stone-500 block">Mobile:</span><b className="font-mono">{createdBooking.farmerPhone}</b></div>
                  <div><span className="text-stone-500 block">Centre:</span><b>{createdBooking.centreName}</b></div>
                  <div><span className="text-stone-500 block">Date:</span><b>{createdBooking.date}</b></div>
                  <div><span className="text-stone-500 block">Vehicle:</span><b>{createdBooking.vehicleNumber || 'Not provided'}</b></div>
                  <div><span className="text-stone-500 block">Queue Position:</span><b>#{createdBooking.queuePosition}</b></div>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg flex items-center justify-between text-xs font-semibold text-amber-950 border border-amber-200"><div className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-600" /><span>{t('booking.peopleAhead')}:</span></div><span className="text-sm font-bold font-mono">{Math.max(0, (createdBooking.queuePosition || 1) - 1)} Farmers Ahead</span></div>
              </div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => window.print()} className="px-4 py-2 border border-stone-300 rounded-lg text-stone-800 font-semibold text-sm flex items-center gap-2"><Printer className="w-4 h-4" />{t('booking.printSlip')}</button><button type="button" onClick={onClose} className="px-5 py-2 bg-emerald-800 text-white rounded-lg font-semibold text-sm">{t('booking.close')}</button></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2 border border-red-200"><AlertTriangle className="w-4 h-4 shrink-0" />{error}<button type="button" onClick={loadCentres} className="ml-auto underline font-bold">Retry</button></div>}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900"><strong>Your booking location:</strong> {user.district || 'Not set'}, {user.state || 'Not set'}. Only centres in your saved state and district can be booked. Update your location from Farmer Desk → My Profile.</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs font-bold text-stone-700 mb-1">Your State</label><div className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold">{user.state || 'Not set'}</div></div>
                <div><label className="block text-xs font-bold text-stone-700 mb-1">Your District</label><div className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold">{user.district || 'Not set'}</div></div>
              </div>
              <CentrePicker centres={allowedCentres} value={selectedCentreId} onChange={handleCentreChange} label="Select Procurement Centre" disabled={loadingCentres || !allowedCentres.length} helper={loadingCentres ? 'Loading the central centre directory…' : !allowedCentres.length ? 'No centre is registered for this state and district. Update your location in My Profile.' : 'Search works across centre name, district, address and PIN.'} />
              {selectedCentre && <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center justify-between"><div><span className="text-stone-500 block text-[11px]">Selected Centre</span><span className="font-bold text-stone-900">{selectedCentre.name}</span><span className="text-stone-500 block mt-0.5"><MapPin className="w-3 h-3 inline mr-1" />{selectedCentre.address}</span></div><div className="text-right"><span className="text-stone-500 block text-[11px]">Available</span><span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{selectedCentre.availableSlots} Slots</span></div></div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label><input disabled value={user.name} className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-xs font-semibold" /></div><div><label className="block text-xs font-bold text-stone-700 mb-1">Mobile Number</label><input disabled value={user.phone} className="w-full px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-xs font-semibold font-mono" /></div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-700" />{t('booking.selectDate')}</label><input type="date" min={todayStr} value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs" /></div><div><label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-700" />{t('booking.selectSlot')}</label><select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"><option>Morning (08:30 AM - 11:30 AM)</option><option>Afternoon (11:30 AM - 02:30 PM)</option><option>Evening (02:30 PM - 05:30 PM)</option></select></div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-emerald-700" />{t('booking.cropType')}</label><select value={cropType} onChange={(e) => setCropType(e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold">{(selectedCentre?.cropsHandled || ['Wheat']).map((crop) => <option key={crop}>{crop}</option>)}</select></div><div><label className="block text-xs font-bold text-stone-700 mb-1">Estimated Quantity (Quintals)</label><input type="number" min="1" max="1000" value={estimatedWeightQuintal} onChange={(e) => setEstimatedWeightQuintal(Number(e.target.value))} required className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono" /></div></div>
              <div><label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-stone-600" />Vehicle Registration No. (Optional)</label><input type="text" placeholder="e.g. HR-05-AB-4421 / Tractor Trolley" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono" /></div>
              <div><label className="block text-xs font-bold text-stone-700 mb-1">Special Notes / Remarks (Optional)</label><input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Moisture pre-tested 11.4%" className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs" /></div>
              <div className="pt-2 border-t border-stone-200 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 font-semibold text-sm">Cancel</button><button type="submit" disabled={submitting || loadingCentres || !selectedCentre || selectedCentre.availableSlots <= 0} className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-sm disabled:opacity-50">{submitting ? 'Booking...' : 'Confirm & Generate Token'}</button></div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
