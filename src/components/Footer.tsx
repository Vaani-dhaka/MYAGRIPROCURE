import React from 'react';
import { Phone, ShieldCheck, Heart, Building2, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Platform Branding */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center font-bold font-serif text-amber-300">
                P
              </div>
              <span className="font-bold text-base tracking-tight font-serif">
                PARADOX AgriProcure
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              National Digital Agriculture & Farmer Procurement Infrastructure. Enabling seamless queue scheduling, fair MSP weighment, and Direct Benefit Transfer (DBT).
            </p>
          </div>

          {/* Col 2: Farmer Services */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-serif">
              Farmer Services
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('centres')}
                  className="hover:text-emerald-400 transition"
                >
                  {t('header.centres')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('track')}
                  className="hover:text-emerald-400 transition"
                >
                  {t('header.trackBooking')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('farmer')}
                  className="hover:text-emerald-400 transition"
                >
                  {t('header.farmerPortal')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('support')}
                  className="hover:text-emerald-400 transition"
                >
                  {t('header.support')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Government Stakeholders */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-serif">
              Operations Portals
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('staff')}
                  className="hover:text-emerald-400 transition"
                >
                  {t('header.staffPortal')} (Mandi Weighbridge)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="hover:text-emerald-400 transition"
                >
                  {t('header.adminPortal')} (Central Board)
                </button>
              </li>
              <li>
                <span className="text-stone-500">e-NAM & Agmarknet Interoperable</span>
              </li>
              <li>
                <span className="text-stone-500">DBT PFMS Integration Gateway</span>
              </li>
            </ul>
          </div>

          {/* Col 4: National Toll-Free Support */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-serif">
              Emergency & Support
            </h4>
            <div className="p-3 bg-stone-800 rounded-xl border border-stone-700 space-y-1">
              <span className="text-[11px] text-amber-300 font-bold block">Kisan Call Centre</span>
              <a
                href="tel:18001801551"
                className="font-mono text-base font-black text-white hover:text-amber-300 block transition"
              >
                1800-180-1551
              </a>
              <span className="text-[10px] text-stone-400 block">Toll-Free • 06:00 AM to 10:00 PM (All 7 Days)</span>
            </div>
            <p className="text-[11px] text-stone-400 pt-1">
              For immediate grievance escalations or electronic weighment disputes, contact your District Agricultural Officer.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
          <div>
            © 2026 PARADOX-AgriProcure • Digital Agriculture Initiative. All Rights Reserved.
          </div>
          <div className="flex items-center gap-3">
            <span>Accessibility Compliant (WCAG 2.1 AA)</span>
            <span>•</span>
            <span>English & हिन्दी Supported</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
