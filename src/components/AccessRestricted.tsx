import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogIn, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/index';

interface AccessRestrictedProps {
  requiredRole: UserRole;
  onOpenLogin: (role: UserRole) => void;
  onGoHome: () => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  requiredRole,
  onOpenLogin,
  onGoHome,
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const roleName =
    requiredRole === 'STAFF'
      ? language === 'hi' ? 'मंडी स्टाफ / खरीद अधिकारी (Staff)' : 'Mandi Procurement Staff'
      : language === 'hi' ? 'केंद्रीय पोर्टल प्रशासक (Administrator)' : 'Central Platform Administrator';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl border border-[#D7DEE7] shadow-lg overflow-hidden">
        {/* Tricolor accent */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        <div className="p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8 text-[#FF9933]" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#16233B] bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              {language === 'hi' ? 'भूमिका-आधारित सुरक्षा प्रतिबंध' : 'Role-Based Access Control'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight">
              {language === 'hi' ? 'अधिकृत अनुमति आवश्यक' : 'Restricted Dashboard Access'}
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              {language === 'hi'
                ? `यह डैशबोर्ड केवल अधिकृत ${roleName} के लिए आरक्षित है। आपकी वर्तमान भूमिका '${user?.role || 'अनधिकृत'}' के पास इस खंड को देखने की अनुमति नहीं है।`
                : `This dashboard is strictly reserved for authorized ${roleName}. Your current authenticated session (${user?.role || 'GUEST'}) does not have permission to access this module.`}
            </p>
          </div>

          {/* Current Session Info */}
          {user && (
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#F3F6FA] border border-[#D7DEE7] rounded-xl text-xs text-stone-700">
              <span className="w-2 h-2 rounded-full bg-[#138808]" />
              <span>
                {language === 'hi' ? 'वर्तमान में लॉग इन:' : 'Signed in as:'}{' '}
                <strong>{user.name}</strong> ({user.role})
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              id="restricted-switch-login-btn"
              onClick={() => onOpenLogin(requiredRole)}
              className="px-5 py-2.5 bg-[#16233B] hover:bg-[#0B1730] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#FF9933]" />
              <span>
                {language === 'hi'
                  ? `अधिकृत ${requiredRole === 'STAFF' ? 'स्टाफ' : 'प्रशासक'} के रूप में लॉगिन करें`
                  : `Sign In as Authorized ${requiredRole === 'STAFF' ? 'Staff' : 'Admin'}`}
              </span>
            </button>

            <button
              type="button"
              id="restricted-go-home-btn"
              onClick={onGoHome}
              className="px-5 py-2.5 bg-white hover:bg-stone-50 text-[#16233B] border border-[#D7DEE7] font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'hi' ? 'मुख्य पृष्ठ पर लौटें' : 'Return to Portal Home'}</span>
            </button>
          </div>

          <div className="pt-6 border-t border-stone-100 text-[11px] text-stone-500">
            {language === 'hi'
              ? 'किसान उपयोगकर्ता अपने स्वयं के स्लॉट और टोकन किसान डैशबोर्ड से देख सकते हैं।'
              : 'Farmer citizens can manage their crop bookings, e-receipts, and live mandi queue from the Farmer Dashboard.'}
          </div>
        </div>
      </div>
    </div>
  );
};
