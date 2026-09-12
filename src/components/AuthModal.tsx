import React, { useEffect, useState } from 'react';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types/index';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  onSuccess?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'FARMER',
  onSuccess,
}) => {
  const { login, register, isLoading, error } = useAuth();
  const { language, t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Login inputs
  const [identifier, setIdentifier] = useState('9876543210');
  const [password, setPassword] = useState('');

  // Register inputs (Farmer only)
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regDistrict, setRegDistrict] = useState('Karnal');
  const [regState, setRegState] = useState('Haryana');
  const [regPassword, setRegPassword] = useState('');
  const [regCategory, setRegCategory] = useState('Small & Marginal Farmer (SMF)');
  const [locationData, setLocationData] = useState<{ state: string; districts: string[] }[]>([]);

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/centres/states-and-districts')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setLocationData(Array.isArray(data) ? data : []))
      .catch(() => setLocationData([]));
  }, []);

  const registrationDistricts = locationData.find((item) => item.state === regState)?.districts || [];

  useEffect(() => {
    if (!isOpen) return;
    setMode('login');
    setSelectedRole(initialRole);
    setLocalError(null);
    setPassword('');
    if (initialRole === 'FARMER') setIdentifier('9876543210');
    if (initialRole === 'STAFF') setIdentifier('9812345678');
    if (initialRole === 'ADMIN') setIdentifier('9899001122');
  }, [isOpen, initialRole]);

  // Keep all hooks above this guard. Conditional hooks cause React's
  // "Rendered more hooks than during the previous render" runtime error.
  if (!isOpen) return null;

  const handleSelectRoleTab = (role: UserRole) => {
    setSelectedRole(role);
    setLocalError(null);
    setPassword('');
    if (role === 'FARMER') setIdentifier('9876543210');
    else if (role === 'STAFF') setIdentifier('9812345678');
    else setIdentifier('9899001122');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const success = await login(identifier, password, selectedRole);
    if (success) {
      if (onSuccess) onSuccess(selectedRole);
      onClose();
    } else {
      setLocalError('Invalid credentials. Please verify your phone/email and password.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!regName || !regPhone || !regPassword || !regState || !regDistrict) {
      setLocalError('Please complete all required fields.');
      return;
    }
    if (!/^\d{10}$/.test(regPhone.trim())) {
      setLocalError('Mobile number must contain exactly 10 digits.');
      return;
    }
    if (regPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    const success = await register({
      name: regName,
      phone: regPhone,
      village: regVillage,
      district: regDistrict,
      state: regState,
      farmerCategory: regCategory,
      password: regPassword,
    });

    if (success) {
      if (onSuccess) onSuccess('FARMER');
      onClose();
    } else {
      setLocalError('Registration failed. Please check your details or phone number.');
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-stone-200 overflow-hidden">
        {/* Header with Tricolor accent */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        <div className="bg-[#0B1730] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16233B] border border-[#233554] flex items-center justify-center text-[#FF9933]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide text-white">
                {language === 'hi' ? 'नागरिक एवं अधिकारी प्रमाणीकरण' : 'Citizen & Officer Authentication'}
              </h3>
              <p className="text-[11px] text-stone-300">
                {language === 'hi'
                  ? 'सुरक्षित भूमिका-आधारित डिजिटल कृषि सेवा पोर्टल'
                  : 'Secure Role-Based Digital Agriculture Portal'}
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-auth-modal-btn"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tabs for Login */}
        {mode === 'login' && (
          <div className="bg-[#F3F6FA] border-b border-[#D7DEE7] px-4 pt-3 flex gap-2">
            <button
              type="button"
              id="auth-tab-farmer"
              onClick={() => handleSelectRoleTab('FARMER')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-t-md flex items-center justify-center gap-1.5 transition ${
                selectedRole === 'FARMER'
                  ? 'bg-white text-[#16233B] border-t-2 border-[#138808] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#138808]" />
              <span>{language === 'hi' ? 'किसान (Farmer)' : 'Farmer'}</span>
            </button>

            <button
              type="button"
              id="auth-tab-staff"
              onClick={() => handleSelectRoleTab('STAFF')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-t-md flex items-center justify-center gap-1.5 transition ${
                selectedRole === 'STAFF'
                  ? 'bg-white text-[#16233B] border-t-2 border-[#FF9933] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>{language === 'hi' ? 'मंडी स्टाफ (Staff)' : 'Mandi Staff'}</span>
            </button>

            <button
              type="button"
              id="auth-tab-admin"
              onClick={() => handleSelectRoleTab('ADMIN')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-t-md flex items-center justify-center gap-1.5 transition ${
                selectedRole === 'ADMIN'
                  ? 'bg-white text-[#16233B] border-t-2 border-[#16233B] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#16233B]" />
              <span>{language === 'hi' ? 'प्रशासक (Admin)' : 'Admin'}</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {(error || localError) && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {selectedRole === 'FARMER'
                    ? language === 'hi' ? 'मोबाइल नंबर / किसान आईडी / ईमेल' : 'Mobile Number / Farmer ID / Email'
                    : selectedRole === 'STAFF'
                    ? language === 'hi' ? 'स्टाफ आईडी / अधिकृत ईमेल' : 'Staff Employee ID / Official Email'
                    : language === 'hi' ? 'प्रशासक क्रेडेंशियल' : 'Administrator Email'}
                </label>
                <input
                  type="text"
                  id="auth-identifier-input"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-[#D7DEE7] rounded-md focus:ring-2 focus:ring-[#16233B] focus:outline-none"
                  placeholder={
                    selectedRole === 'FARMER'
                      ? '9876543210 or farmer@example.com'
                      : selectedRole === 'STAFF'
                      ? 'staff@example.com'
                      : 'admin@example.com'
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    {language === 'hi' ? 'पासवर्ड / सुरक्षा पिन' : 'Password / Security PIN'}
                  </label>
                  <span className="text-[11px] text-stone-500">Use your registered password</span>
                </div>
                <input
                  type="password"
                  id="auth-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-[#D7DEE7] rounded-md focus:ring-2 focus:ring-[#16233B] focus:outline-none font-mono"
                  placeholder="••••••••"
                />
              </div>

              <div className="p-3 bg-[#F3F6FA] border border-[#D7DEE7] rounded-lg text-xs space-y-1 text-stone-600">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <KeyRound className="w-3.5 h-3.5 text-[#FF9933]" />
                  <span>Role-based secure login</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  {selectedRole === 'FARMER'
                    ? 'Farmer access: bookings, queue tracking, profile and support.'
                    : selectedRole === 'STAFF'
                    ? 'Staff access: only the procurement centre(s) authorised for this staff account.'
                    : 'Admin access: central administration, reports, centres and grievances.'}
                </p>
              </div>

              <button
                type="submit"
                id="auth-submit-btn"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#16233B] hover:bg-[#0B1730] text-white font-bold text-sm rounded-md shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : language === 'hi' ? 'सत्यापित कर लॉगिन करें' : 'Sign In with Selected Role'}</span>
                <ArrowRight className="w-4 h-4 text-[#FF9933]" />
              </button>

              {selectedRole === 'FARMER' && (
                <div className="pt-2 text-center">
                  <span className="text-xs text-stone-500">
                    {language === 'hi' ? 'नया किसान खाता खोलना है?' : 'Are you a new farmer?'}{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-xs font-bold text-[#138808] hover:underline cursor-pointer"
                  >
                    {language === 'hi' ? 'निशुल्क पंजीकरण करें' : 'Register New Farmer Profile'}
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* Farmer Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="text-xs text-stone-600 mb-2">
                {language === 'hi'
                  ? 'नया किसान खाता बनाकर स्लॉट बुकिंग एवं डीबीटी लाभ प्राप्त करें।'
                  : 'Create a new farmer profile for immediate mandi slot reservations.'}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'किसान का पूरा नाम *' : 'Farmer Full Name *'}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="e.g. Suresh Chand Meena"
                  className="w-full px-3 py-1.5 text-sm border border-[#D7DEE7] rounded-md focus:ring-2 focus:ring-[#16233B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                    placeholder="98XXXXXXXX"
                    className="w-full px-3 py-1.5 text-sm border border-[#D7DEE7] rounded-md focus:ring-2 focus:ring-[#16233B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'hi' ? 'गांव / कस्बा' : 'Village / Town'}
                  </label>
                  <input
                    type="text"
                    value={regVillage}
                    onChange={(e) => setRegVillage(e.target.value)}
                    placeholder="Village name"
                    className="w-full px-3 py-1.5 text-sm border border-[#D7DEE7] rounded-md focus:ring-2 focus:ring-[#16233B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'hi' ? 'जिला *' : 'District *'}
                  </label>
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-sm border border-[#D7DEE7] rounded-md focus:ring-2 focus:ring-[#16233B]"
                  >
                    <option value="">Select District</option>
                    {registrationDistricts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {language === 'hi' ? 'राज्य *' : 'State *'}
                  </label>
                  <select
                    value={regState}
                    onChange={(e) => {
                      const nextState = e.target.value;
                      setRegState(nextState);
                      const firstDistrict = locationData.find((item) => item.state === nextState)?.districts?.[0] || '';
                      setRegDistrict(firstDistrict);
                    }}
                    required
                    className="w-full px-3 py-1.5 text-sm border border-[#D7DEE7] rounded-md focus:ring-2 focus:ring-[#16233B]"
                  >
                    <option value="">Select State</option>
                    {locationData.map((item) => (
                      <option key={item.state} value={item.state}>{item.state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'hi' ? 'पासवर्ड बनाएं *' : 'Create Password *'}
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-1.5 text-sm border border-[#D7DEE7] rounded-md focus:ring-2 focus:ring-[#16233B]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#138808] hover:bg-[#0f6c06] text-white font-bold text-sm rounded-md shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Creating Account...' : 'Complete Farmer Registration'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-stone-700 hover:text-stone-900 cursor-pointer"
                >
                  ← {language === 'hi' ? 'मौजूदा खाते से लॉगिन करें' : 'Back to Login'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
