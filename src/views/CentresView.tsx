import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Calendar,
  Phone,
  Navigation,
  CheckCircle,
  AlertCircle,
  Filter,
  X,
  Building2,
  Wheat,
  RotateCcw,
  Info,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { sortCentres } from '../utils/centreUtils';
import { Centre } from '../types/index';

interface CentresViewProps {
  onSelectCentreForBooking: (centre: Centre) => void;
}

export const CentresView: React.FC<CentresViewProps> = ({ onSelectCentreForBooking }) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const canBook = user?.role === 'FARMER';

  const [centres, setCentres] = useState<Centre[]>([]);
  const [statesDistricts, setStatesDistricts] = useState<{ state: string; districts: string[] }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [nearestCentreId, setNearestCentreId] = useState<string | null>(null);

  // Details Modal State
  const [selectedCentreForDetails, setSelectedCentreForDetails] = useState<Centre | null>(null);

  // Fetch initial centres & states
  useEffect(() => {
    fetch('/api/centres')
      .then((res) => res.json())
      .then((data) => {
        setCentres(sortCentres(data));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching centres:', err);
        setLoading(false);
      });

    fetch('/api/centres/states-and-districts')
      .then((res) => res.json())
      .then((data) => setStatesDistricts(data))
      .catch((err) => console.error('Error fetching states:', err));
  }, []);

  // Districts for current state
  const availableDistricts = useMemo(() => {
    if (selectedState === 'ALL') return [];
    const stateObj = statesDistricts.find((s) => s.state === selectedState);
    return stateObj ? stateObj.districts : [];
  }, [selectedState, statesDistricts]);

  // Handle Geolocation to find nearest centre. If browser permission is denied,
  // provide a working PIN fallback instead of leaving the button with no result.
  const focusNearestCentre = (centreId: string) => {
    setNearestCentreId(centreId);
    window.setTimeout(() => {
      document.getElementById(`centre-card-${centreId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleFindNearest = () => {
    if (!centres.length) {
      setLocationError('Procurement centres are still loading. Please try again in a moment.');
      return;
    }
    if (!navigator.geolocation) {
      setLocationError('Location is not available in this browser. Enter your 6-digit PIN below.');
      document.getElementById('nearest-pin-input')?.focus();
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(location);

        // Pick the closest centre immediately so the button has a clear result.
        let closest: { id: string; distance: number } | null = null;
        for (const c of centres) {
          if (!Number.isFinite(c.latitude) || !Number.isFinite(c.longitude)) continue;
          const distance = calculateDistance(location.lat, location.lng, c.latitude, c.longitude);
          if (!closest || distance < closest.distance) closest = { id: c.id, distance };
        }
        if (closest) {
          const nearest = centres.find((c) => c.id === closest!.id);
          if (nearest) {
            setSelectedState(nearest.state);
            setSelectedDistrict(nearest.district);
            focusNearestCentre(nearest.id);
          }
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
        // If the farmer is logged in, fall back to the farmer's saved district.
        if (user?.state && user?.district) {
          const local = centres.filter((c) => c.state.toLowerCase() === user.state!.toLowerCase() && c.district.toLowerCase() === user.district!.toLowerCase());
          const nearestAvailable = sortCentres(local)[0];
          if (nearestAvailable) {
            setSelectedState(nearestAvailable.state);
            setSelectedDistrict(nearestAvailable.district);
            focusNearestCentre(nearestAvailable.id);
          }
        }
        setLocationError('Location permission was denied. Enter your 6-digit PIN below to find a nearby listed centre.');
        document.getElementById('nearest-pin-input')?.focus();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handlePinSearch = () => {
    const normalized = pinCode.replace(/\D/g, '').slice(0, 6);
    if (normalized.length !== 6) {
      setLocationError('Please enter a valid 6-digit PIN code.');
      return;
    }

    const exact = centres.find((c) => c.pinCode === normalized);
    const prefix = normalized.slice(0, 3);
    const regional = centres.filter((c) => c.pinCode.startsWith(prefix));
    const match = exact || sortCentres(regional)[0];

    if (!match) {
      setLocationError('No procurement centre was found for that PIN. Try another nearby PIN.');
      return;
    }

    setSelectedState(match.state);
    setSelectedDistrict(match.district);
    setUserLocation(null);
    setLocationError(exact ? `Nearest centre matched to PIN ${normalized}.` : `Showing the nearest listed centre in the ${prefix} PIN region.`);
    focusNearestCentre(match.id);
  };

  // Calculate distance in KM using Haversine Formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  // Filter and Sort centres
  const filteredCentres = useMemo(() => {
    let result = centres.map((c) => {
      let distanceKm: number | undefined = undefined;
      if (userLocation && c.latitude && c.longitude) {
        distanceKm = calculateDistance(userLocation.lat, userLocation.lng, c.latitude, c.longitude);
      }
      return { ...c, distanceKm };
    });

    // 1. State Filter
    if (selectedState !== 'ALL') {
      result = result.filter((c) => c.state.toLowerCase() === selectedState.toLowerCase());
    }

    // 2. District Filter
    if (selectedDistrict !== 'ALL') {
      result = result.filter((c) => c.district.toLowerCase() === selectedDistrict.toLowerCase());
    }

    // 3. Status Filter
    if (selectedStatus !== 'ALL') {
      result = result.filter((c) => c.status === selectedStatus);
    }

    // 4. Search Query (Name, PIN, Address, Crop)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.pinCode.includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.cropsHandled.some((crop) => crop.toLowerCase().includes(q))
      );
    }

    // 5. Sort by distance if user location is available
    if (userLocation) {
      result.sort((a, b) => {
        if (a.distanceKm === undefined) return 1;
        if (b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });
    }

    return result;
  }, [centres, selectedState, selectedDistrict, selectedStatus, searchQuery, userLocation]);

  const resetFilters = () => {
    setSelectedState('ALL');
    setSelectedDistrict('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setUserLocation(null);
    setNearestCentreId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* 1. DIRECTORY HEADER & MANDATORY NOTICE */}
      <div className="bg-white p-6 rounded-xl border border-[#D7DEE7] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-1 bg-[#138808] rounded-full" />
              <span className="text-xs font-bold tracking-widest text-[#16233B] uppercase">
                {language === 'hi' ? 'अखिल भारतीय खरीद केंद्र निर्देशिका' : 'National Mandi Directory'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
              {t('centres.title')}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              {t('centres.subtitle')}
            </p>
          </div>

          {/* GPS Proximity Finder */}
          <button
            type="button"
            id="find-nearest-gps-btn"
            onClick={handleFindNearest}
            disabled={locating}
            className="px-4 py-2.5 bg-[#16233B] hover:bg-[#0B1730] text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-[#FF9933]" />
            <span>{locating ? t('centres.locating') : t('centres.findNearest')}</span>
          </button>
        </div>

        {/* Required Public Service Demo Disclaimer Notice */}
        <div className="p-3.5 rounded-lg bg-[#F3F6FA] border border-[#D7DEE7] text-stone-700 flex items-start gap-2.5 text-xs">
          <Info className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
          <div>
            <strong className="text-stone-900 font-semibold block">
              {language === 'hi' ? 'महत्वपूर्ण सूचना' : 'Notice'}:
            </strong>
            <span>
              {language === 'hi'
                ? 'केंद्र की जानकारी प्रदर्शन एवं विकास डेटा के रूप में प्रस्तुत की गई है। कृपया संबंधित मंडी प्राधिकरण के साथ परिचालन विवरण सत्यापित करें।'
                : 'Centre information shown as demo/development data. Please verify operational details with the relevant authority.'}
            </span>
          </div>
        </div>

        {locationError && (
          <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            {locationError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="flex-1">
            <label className="block text-[11px] font-bold text-stone-600 mb-1">Find by PIN (fallback if GPS is unavailable)</label>
            <input
              id="nearest-centre-pin-input"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePinSearch(); }}
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit PIN"
              className="w-full px-3 py-2 border border-[#D7DEE7] rounded-lg text-xs font-mono"
            />
          </div>
          <button
            type="button"
            onClick={handlePinSearch}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold"
          >
            Find by PIN
          </button>
        </div>
      </div>

      {/* 2. CASCADING SEARCH & FILTER PANEL */}
      <div className="bg-white p-5 rounded-xl border border-[#D7DEE7] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* State Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('centres.selectState')}
            </label>
            <select
              id="filter-state-select"
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('ALL');
              }}
              className="w-full px-3 py-2 border border-[#D7DEE7] rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#16233B] focus:outline-none"
            >
              <option value="ALL">All States & UTs ({statesDistricts.length})</option>
              {statesDistricts.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
          </div>

          {/* District Cascading Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('centres.selectDistrict')}
            </label>
            <select
              id="filter-district-select"
              value={selectedDistrict}
              disabled={selectedState === 'ALL'}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-[#D7DEE7] rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#16233B] focus:outline-none disabled:bg-stone-100 disabled:cursor-not-allowed"
            >
              <option value="ALL">{t('centres.allDistricts')}</option>
              {availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {t('centres.filterStatus')}
            </label>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-[#D7DEE7] rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#16233B] focus:outline-none"
            >
              <option value="ALL">{t('centres.allStatuses')}</option>
              <option value="OPEN">{t('centres.open')}</option>
              <option value="FULL">{t('centres.full')}</option>
              <option value="CLOSED">{t('centres.closed')}</option>
            </select>
          </div>

          {/* Free Text Search */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {language === 'hi' ? 'खोजें (केंद्र / पिन कोड / फसल)' : 'Search Mandi / PIN / Crop'}
            </label>
            <div className="relative">
              <input
                type="text"
                id="filter-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('centres.searchPlaceholder') || 'e.g. Karnal, 132001, Wheat'}
                className="w-full pl-8 pr-3 py-2 border border-[#D7DEE7] rounded-lg text-xs focus:ring-2 focus:ring-[#16233B] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Results Count & Reset Controls */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] pt-2 border-t border-stone-100 gap-2">
          <div>
            Found <strong className="text-[#16233B] font-mono font-bold">{filteredCentres.length}</strong> {t('centres.totalFound')}
            {selectedState !== 'ALL' && ` in ${selectedState}`}
            {userLocation && ' (sorted by nearest distance)'}
          </div>
          {(selectedState !== 'ALL' || selectedDistrict !== 'ALL' || selectedStatus !== 'ALL' || searchQuery || userLocation) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#16233B] hover:text-[#FF9933] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. CENTRES GRID */}
      {loading ? (
        <div className="text-center py-12 text-stone-500 text-sm">
          {t('common.loading')}
        </div>
      ) : filteredCentres.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-[#D7DEE7] p-8 space-y-3">
          <Building2 className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-bold text-stone-800 text-base">{t('common.noData')}</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            No procurement centres found matching the selected filters. Try selecting another district or reset filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-[#16233B] text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Show All Centres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCentres.map((centre) => {
            const isFull = centre.availableSlots <= 0 || centre.status === 'FULL';
            const isClosed = centre.status === 'CLOSED';
            const capacityRatio = Math.round(((centre.capacityPerDay - centre.availableSlots) / centre.capacityPerDay) * 100);

            return (
              <div
                key={centre.id}
                id={`centre-card-${centre.id}`}
                className={`bg-white rounded-xl border ${nearestCentreId === centre.id ? 'border-[#FF9933] ring-2 ring-[#FF9933]/30' : 'border-[#D7DEE7]'} hover:border-[#16233B] shadow-xs hover:shadow-md transition duration-150 flex flex-col justify-between overflow-hidden`}
              >
                {/* Card Top Details */}
                <div className="p-5 space-y-3">
                  {/* Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F3F6FA] text-stone-800 uppercase tracking-wide border border-[#D7DEE7]">
                      {centre.state}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isClosed
                          ? 'bg-red-100 text-red-800'
                          : isFull
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-red-600' : isFull ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                      {isClosed ? t('centres.closed') : isFull ? t('centres.full') : t('centres.open')}
                    </span>
                  </div>

                  {/* Name & Address */}
                  <div>
                    <h3
                      onClick={() => setSelectedCentreForDetails(centre)}
                      className="font-bold text-base text-[#172033] leading-snug hover:text-[#FF9933] transition cursor-pointer"
                    >
                      {centre.name}
                    </h3>
                    <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#138808] shrink-0" />
                      <span>{centre.district}, {centre.state} • PIN: {centre.pinCode}</span>
                    </p>
                    {centre.distanceKm !== undefined && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        📍 ~{centre.distanceKm} km away from your GPS location
                      </span>
                    )}
                  </div>

                  {/* Daily Slot Capacity Bar */}
                  <div className="p-3 bg-[#F3F6FA] rounded-lg space-y-1.5 border border-[#D7DEE7]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-600 font-medium">{t('centres.available')}:</span>
                      <span className="font-bold font-mono text-[#16233B]">
                        {centre.availableSlots} / {centre.capacityPerDay}
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          capacityRatio > 85 ? 'bg-[#FF9933]' : 'bg-[#138808]'
                        }`}
                        style={{ width: `${Math.min(100, capacityRatio)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                      <span>{t('centres.queue')}: <strong className="font-mono text-stone-800">{centre.currentQueue} Farmers</strong></span>
                      <span>Hours: {centre.operatingHours}</span>
                    </div>
                  </div>

                  {/* Crops Handled */}
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                      {t('centres.crops')}:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {centre.cropsHandled.map((crop) => (
                        <span
                          key={crop}
                          className="text-[10px] bg-white text-[#16233B] px-2 py-0.5 rounded border border-[#D7DEE7] font-medium"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-stone-50 border-t border-[#D7DEE7] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCentreForDetails(centre)}
                    className="px-3 py-2 bg-white hover:bg-stone-100 text-[#16233B] border border-[#D7DEE7] rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    View Details
                  </button>

                  {canBook && (
                    <button
                      type="button"
                      id={`book-slot-btn-${centre.id}`}
                      disabled={isFull || isClosed}
                      onClick={() => onSelectCentreForBooking(centre)}
                      className="flex-1 py-2 px-3 bg-[#FF9933] hover:bg-[#e68524] text-stone-950 rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{isFull ? t('centres.full') : t('centres.bookNow')}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. CENTRE DETAILS MODAL (Specification #10) */}
      {selectedCentreForDetails && (
        <div
          id="centre-details-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-stone-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#0B1730] text-white px-6 py-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#FF9933] uppercase tracking-wider">
                  Mandi Centre Information
                </span>
                <h3 className="font-bold text-base text-white">
                  {selectedCentreForDetails.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCentreForDetails(null)}
                className="text-stone-400 hover:text-white p-1 rounded transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Notice label */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                Centre information shown as demo/development data. Please verify operational details with the relevant authority.
              </div>

              {/* Core Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7]">
                  <span className="text-stone-500 block font-medium">State</span>
                  <strong className="text-stone-900 font-bold block mt-0.5">{selectedCentreForDetails.state}</strong>
                </div>

                <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7]">
                  <span className="text-stone-500 block font-medium">District</span>
                  <strong className="text-stone-900 font-bold block mt-0.5">{selectedCentreForDetails.district}</strong>
                </div>

                <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7]">
                  <span className="text-stone-500 block font-medium">PIN Code</span>
                  <strong className="text-stone-900 font-mono font-bold block mt-0.5">{selectedCentreForDetails.pinCode}</strong>
                </div>

                <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7]">
                  <span className="text-stone-500 block font-medium">Operating Hours</span>
                  <strong className="text-stone-900 font-mono block mt-0.5">{selectedCentreForDetails.operatingHours}</strong>
                </div>

                <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7]">
                  <span className="text-stone-500 block font-medium">Working Days</span>
                  <strong className="text-stone-900 block mt-0.5">{selectedCentreForDetails.workingDays || 'Monday - Saturday'}</strong>
                </div>

                <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7]">
                  <span className="text-stone-500 block font-medium">Current Status</span>
                  <strong className={`font-bold block mt-0.5 ${
                    selectedCentreForDetails.status === 'OPEN' ? 'text-[#138808]' : selectedCentreForDetails.status === 'FULL' ? 'text-[#FF9933]' : 'text-red-600'
                  }`}>
                    {selectedCentreForDetails.status}
                  </strong>
                </div>

                <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7]">
                  <span className="text-stone-500 block font-medium">Daily Capacity</span>
                  <strong className="text-stone-900 font-mono font-bold block mt-0.5">{selectedCentreForDetails.capacityPerDay} Farmers/Day</strong>
                </div>

                <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7]">
                  <span className="text-stone-500 block font-medium">Available Slots</span>
                  <strong className="text-[#138808] font-mono font-bold block mt-0.5">{selectedCentreForDetails.availableSlots} Open</strong>
                </div>

                <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7]">
                  <span className="text-stone-500 block font-medium">Current Queue</span>
                  <strong className="text-[#16233B] font-mono font-bold block mt-0.5">{selectedCentreForDetails.currentQueue} Farmers waiting</strong>
                </div>
              </div>

              {/* Full Address */}
              <div className="p-3 bg-[#F3F6FA] rounded-lg border border-[#D7DEE7] text-xs">
                <span className="text-stone-500 block font-medium">Physical Address</span>
                <p className="text-stone-900 font-semibold mt-0.5">
                  {selectedCentreForDetails.address}, {selectedCentreForDetails.district}, {selectedCentreForDetails.state} - {selectedCentreForDetails.pinCode}
                </p>
              </div>

              {/* Crops Handled */}
              <div className="text-xs space-y-1">
                <span className="text-stone-600 font-medium">Procurement Crops Handled:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedCentreForDetails.cropsHandled.map((crop) => (
                    <span key={crop} className="px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded-md border border-emerald-200 font-medium">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-stone-50 border-t border-[#D7DEE7] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedCentreForDetails.phone}`}
                  className="px-3 py-2 bg-white hover:bg-stone-100 text-[#16233B] border border-[#D7DEE7] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-[#16233B]" />
                  <span>Call {selectedCentreForDetails.phone}</span>
                </a>

                {selectedCentreForDetails.latitude && selectedCentreForDetails.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedCentreForDetails.latitude},${selectedCentreForDetails.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 bg-white hover:bg-stone-100 text-[#16233B] border border-[#D7DEE7] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#138808]" />
                    <span>View on Map</span>
                  </a>
                )}
              </div>

              {canBook && (
                <button
                  type="button"
                  disabled={selectedCentreForDetails.status === 'CLOSED' || selectedCentreForDetails.availableSlots <= 0}
                  onClick={() => {
                    const c = selectedCentreForDetails;
                    setSelectedCentreForDetails(null);
                    onSelectCentreForBooking(c);
                  }}
                  className="px-5 py-2 bg-[#FF9933] hover:bg-[#e68524] text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-40 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Slot at this Centre</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
