import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Wallet,
  Coins,
  Package,
  Landmark,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  AlertCircle,
  FileText,
  Edit2,
  Save,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Booking, Product, WalletTransaction, BankDetails, Centre } from '../types/index';
import { CentrePicker } from '../components/CentrePicker';

interface FarmerPortalViewProps {
  onBookNewSlot: () => void;
  onTrackToken: (token: string) => void;
}

export const FarmerPortalView: React.FC<FarmerPortalViewProps> = ({ onBookNewSlot, onTrackToken }) => {
  const { language, t } = useLanguage();
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'bookings' | 'wallet' | 'products' | 'bank' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wallet, setWallet] = useState<{
    balance: { credits: number; earned: number; used: number };
    transactions: WalletTransaction[];
    bankDetails: BankDetails | null;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile Edit State
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileVillage, setProfileVillage] = useState(user?.village || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileState, setProfileState] = useState(user?.state || '');
  const [profileDistrict, setProfileDistrict] = useState(user?.district || '');
  const [profileCentreId, setProfileCentreId] = useState(user?.preferredCentreId || '');
  const [locationData, setLocationData] = useState<{ state: string; districts: string[] }[]>([]);
  const [profileCentres, setProfileCentres] = useState<Centre[]>([]);

  // Bank Form State
  const [bankAcc, setBankAcc] = useState('••••••••4892');
  const [bankHolder, setBankHolder] = useState(user?.name || 'Ramesh Kumar Patel');
  const [bankIfsc, setBankIfsc] = useState('PUNB0123400');
  const [bankName, setBankName] = useState('Punjab National Bank');
  const [bankBranch, setBankBranch] = useState('Karnal Main Agricultural Branch');
  const [bankSavedMsg, setBankSavedMsg] = useState(false);

  // Redeem feedback
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const fetchFarmerData = async () => {
    const token = localStorage.getItem('paradox_token');
    try {
      const [bRes, wRes, pRes] = await Promise.all([
        fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/wallet', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products'),
      ]);

      if (bRes.ok) setBookings(await bRes.json());
      if (wRes.ok) {
        const wData = await wRes.json();
        setWallet(wData);
        if (wData.bankDetails) {
          setBankAcc(wData.bankDetails.accountNumber);
          setBankHolder(wData.bankDetails.accountHolderName);
          setBankIfsc(wData.bankDetails.ifscCode);
          setBankName(wData.bankDetails.bankName);
          setBankBranch(wData.bankDetails.branchName);
        }
      }
      if (pRes.ok) setProducts(await pRes.json());
    } catch (err) {
      console.error('Error fetching farmer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, [user]);

  useEffect(() => {
    setProfileName(user?.name || '');
    setProfileVillage(user?.village || '');
    setProfilePhone(user?.phone || '');
    setProfileState(user?.state || '');
    setProfileDistrict(user?.district || '');
    setProfileCentreId(user?.preferredCentreId || '');
  }, [user]);

  useEffect(() => {
    fetch('/api/centres')
      .then((res) => res.ok ? res.json() : [])
      .then((centreList) => {
        const list = Array.isArray(centreList) ? centreList : [];
        setProfileCentres(list);
        const states = [...new Set(list.map((c: Centre) => c.state))].sort((a, b) => a.localeCompare(b));
        const derived = states.map((state) => ({
          state,
          districts: [...new Set(list.filter((c: Centre) => c.state === state).map((c: Centre) => c.district))].sort((a, b) => a.localeCompare(b)),
        }));
        setLocationData(derived);
      })
      .catch(() => { setLocationData([]); setProfileCentres([]); });
  }, []);

  const availableProfileDistricts = (locationData.find((item) => item.state.toLowerCase() === profileState.toLowerCase())?.districts || []);
  const availableProfileCentres = profileCentres
    .filter((c) => c.state.trim().toLowerCase() === profileState.trim().toLowerCase() && c.district.trim().toLowerCase() === profileDistrict.trim().toLowerCase())
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({
      name: profileName,
      village: profileVillage,
      phone: profilePhone,
      state: profileState,
      district: profileDistrict,
      preferredCentreId: profileCentreId,
    });
    if (success) {
      setEditingProfile(false);
    }
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('paradox_token');
    try {
      const res = await fetch('/api/wallet/bank-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accountNumber: bankAcc,
          accountHolderName: bankHolder,
          ifscCode: bankIfsc,
          bankName,
          branchName: bankBranch,
        }),
      });
      if (res.ok) {
        setBankSavedMsg(true);
        setTimeout(() => setBankSavedMsg(false), 3000);
      }
    } catch (err) {
      console.error('Bank save error:', err);
    }
  };

  const handleRedeem = async (productId: string, productName: string) => {
    const token = localStorage.getItem('paradox_token');
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      const res = await fetch('/api/wallet/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Redemption failed');
      }

      setRedeemSuccess(`Successfully redeemed ${productName}! Items will be issued at the centre.`);
      fetchFarmerData();
    } catch (err: any) {
      setRedeemError(err.message || 'Error processing redemption');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. FARMER PROFILE HEADER CARD */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-2xl font-serif shadow-md shrink-0">
            {user?.name?.charAt(0) || 'R'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                {user?.name || 'Ramesh Kumar Patel'}
              </h1>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Farmer
              </span>
            </div>

            <p className="text-xs text-stone-600 mt-1 flex flex-wrap items-center gap-3">
              <span>ID: <strong className="font-mono text-stone-800">{user?.farmerId || 'FMR-2026-7789'}</strong></span>
              <span>•</span>
              <span>Village: <strong className="text-stone-800">{user?.village || 'Kachhwa'}</strong></span>
              <span>•</span>
              <span>District: <strong className="text-stone-800">{user?.district || 'Karnal'}, {user?.state || 'Haryana'}</strong></span>
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            type="button"
            onClick={onBookNewSlot}
            className="flex-1 md:flex-none px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-black transition shadow-sm"
          >
            {t('hero.bookSlot')}
          </button>
        </div>
      </div>

      {/* 2. SUB-TABS NAVIGATION */}
      <div className="flex border-b border-stone-200 gap-2 overflow-x-auto scrollbar-none text-xs sm:text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-emerald-800 text-emerald-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{t('farmer.myBookings')} ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wallet')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'wallet'
              ? 'border-emerald-800 text-emerald-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t('farmer.wallet')} ({wallet?.balance.credits || 0} Pts)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-emerald-800 text-emerald-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t('farmer.redeemProducts')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bank')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bank'
              ? 'border-emerald-800 text-emerald-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Bank Account (DBT)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-emerald-800 text-emerald-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t('farmer.myProfile')}</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB A: MY BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-800 text-base">{t('farmer.noBookings')}</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Reserve your date & time slot at your nearest mandi to avoid queue waiting.
              </p>
              <button
                type="button"
                onClick={onBookNewSlot}
                className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold"
              >
                {t('farmer.bookFirst')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-600 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block tracking-wider">
                        Booking Token
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-900">
                        {b.bookingToken}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        b.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'WAITING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-stone-700">
                    <p className="font-bold text-stone-900">{b.centreName}</p>
                    <p className="text-stone-500">
                      Scheduled: <strong className="text-stone-800">{b.date}</strong> • {b.timeSlot}
                    </p>
                    <p className="text-stone-500">
                      Crop: <strong className="text-emerald-800">{b.cropType}</strong> ({b.estimatedWeightQuintal} Qtl)
                    </p>
                    <p className="text-stone-500">
                      Vehicle: <strong className="font-mono text-stone-800">{b.vehicleNumber || 'Not provided'}</strong>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onTrackToken(b.bookingToken)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                    >
                      <span>Track Queue</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 transition"
                      title="Print Token"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB B: AGRI-WALLET & CREDITS */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Wallet Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-5 rounded-2xl shadow-md space-y-2">
              <span className="text-xs text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-4 h-4" />
                {t('farmer.creditsBalance')}
              </span>
              <div className="text-3xl font-black font-mono">
                {wallet?.balance.credits || 0}{' '}
                <span className="text-xs font-normal text-emerald-200">Credits</span>
              </div>
              <p className="text-[11px] text-emerald-200">
                Redeemable for certified seeds & bio-fertilizers.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-medium block">
                {t('farmer.creditsEarned')}
              </span>
              <div className="text-2xl font-black font-mono text-emerald-700">
                +{wallet?.balance.earned || 0}
              </div>
              <span className="text-[11px] text-stone-400">Punctuality & quality compliance</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-medium block">
                {t('farmer.creditsUsed')}
              </span>
              <div className="text-2xl font-black font-mono text-amber-700">
                -{wallet?.balance.used || 0}
              </div>
              <span className="text-[11px] text-stone-400">Redeemed for agricultural inputs</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t('farmer.demoWalletNotice')}</span>
          </div>

          {/* Transactions List */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900 uppercase tracking-wider">
              Recent Credits Activity
            </h3>
            <div className="divide-y divide-stone-100">
              {wallet?.transactions.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-stone-900 block">
                      {language === 'hi' ? (t.descriptionHi || t.description) : t.description}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">{t.date}</span>
                  </div>
                  <span
                    className={`font-mono font-bold text-sm ${
                      t.type === 'CREDIT' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {t.type === 'CREDIT' ? `+${t.amount}` : `-${t.amount}`} Pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB C: REDEEM PRODUCTS CATALOG */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {redeemSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{redeemSuccess}</span>
            </div>
          )}

          {redeemError && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{redeemError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => {
              const canAfford = (wallet?.balance.credits || 0) >= p.creditCost;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-40 object-cover"
                  />

                  <div className="p-4 space-y-2 flex-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      {language === 'hi' ? (p.categoryHi || p.category) : p.category}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm leading-snug">
                      {language === 'hi' ? (p.nameHi || p.name) : p.name}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-2">
                      {language === 'hi' ? (p.descriptionHi || p.description) : p.description}
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Cost:</span>
                      <span className="text-base font-black font-mono text-emerald-900">
                        {p.creditCost} Credits
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleRedeem(p.id, p.name)}
                      className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                    >
                      {canAfford ? t('farmer.redeemWithCredits') : 'Need More Credits'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB D: BANK DETAILS (DBT) */}
      {activeTab === 'bank' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs max-w-2xl space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-lg text-stone-900 font-serif flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-800" />
              <span>{t('farmer.bankTitle')}</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">{t('farmer.bankNotice')}</p>
          </div>

          {bankSavedMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bank details saved successfully for Direct Benefit Transfer!</span>
            </div>
          )}

          <form onSubmit={handleSaveBank} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t('farmer.accountNumber')}</label>
              <input
                type="text"
                required
                value={bankAcc}
                onChange={(e) => setBankAcc(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t('farmer.accountHolder')}</label>
              <input
                type="text"
                required
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('farmer.ifsc')}</label>
                <input
                  type="text"
                  required
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t('farmer.bankName')}</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t('farmer.branch')}</label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{t('farmer.saveProfile')}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB E: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs max-w-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-lg text-stone-900 font-serif">
              {t('farmer.myProfile')}
            </h3>
            <button
              type="button"
              onClick={() => setEditingProfile(!editingProfile)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{editingProfile ? 'Cancel' : t('farmer.editProfile')}</span>
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled={!editingProfile}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg disabled:bg-stone-50 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Mobile Phone</label>
                <input
                  type="text"
                  disabled={!editingProfile}
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg disabled:bg-stone-50 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Village / Panchayat</label>
                <input
                  type="text"
                  disabled={!editingProfile}
                  value={profileVillage}
                  onChange={(e) => setProfileVillage(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg disabled:bg-stone-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">State</label>
                <select
                  disabled={!editingProfile}
                  value={profileState}
                  onChange={(e) => {
                    const state = e.target.value;
                    const firstDistrict = locationData.find((item) => item.state.toLowerCase() === state.toLowerCase())?.districts?.[0] || '';
                    const firstCentre = profileCentres.find((c) => c.state.toLowerCase() === state.toLowerCase() && c.district.toLowerCase() === firstDistrict.toLowerCase());
                    setProfileState(state);
                    setProfileDistrict(firstDistrict);
                    setProfileCentreId(firstCentre?.id || '');
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg disabled:bg-stone-50"
                >
                  <option value="">Select State</option>
                  {locationData.map((item) => <option key={item.state} value={item.state}>{item.state}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">District</label>
                <select
                  disabled={!editingProfile || !profileState}
                  value={profileDistrict}
                  onChange={(e) => {
                    const district = e.target.value;
                    const firstCentre = profileCentres.find((c) => c.state.toLowerCase() === profileState.toLowerCase() && c.district.toLowerCase() === district.toLowerCase());
                    setProfileDistrict(district);
                    setProfileCentreId(firstCentre?.id || '');
                  }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg disabled:bg-stone-50"
                >
                  <option value="">Select District</option>
                  {availableProfileDistricts.map((district) => <option key={district} value={district}>{district}</option>)}
                </select>
              </div>
            </div>

            <CentrePicker
              centres={availableProfileCentres}
              value={profileCentreId}
              onChange={setProfileCentreId}
              label="Preferred Procurement Centre"
              disabled={!editingProfile || !profileState || !profileDistrict}
              helper="Choose your preferred centre after selecting State and District. The booking page will use this location."
            />

            {editingProfile && (
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                {t('farmer.saveProfile')}
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
