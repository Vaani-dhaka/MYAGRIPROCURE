import React from 'react';
import {
  ShieldCheck,
  Target,
  Eye,
  CheckCircle2,
  Users,
  Building2,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Info,
  Scale,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AboutViewProps {
  onNavigate: (tab: string) => void;
  onBookNow: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate, onBookNow }) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Header Banner */}
      <section className="bg-white border-b border-[#D7DEE7] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-[#FF9933] rounded-full" />
            <span className="text-xs font-bold tracking-widest text-[#16233B] uppercase">
              {language === 'hi' ? 'संस्थागत परिचय एवं उद्देश्य' : 'Institutional Overview & Mission'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
            {language === 'hi' ? 'पैराडॉक्स एग्रीप्रोक्योर के बारे में' : 'About PARADOX AgriProcure'}
          </h1>

          <p className="text-base text-[#64748B] max-w-3xl leading-relaxed">
            {language === 'hi'
              ? 'किसानों, खरीद केंद्रों और नागरिक सहायता सेवाओं को एक एकीकृत डिजिटल प्लेटफॉर्म पर जोड़ना — पारदर्शी, कुशल एवं समयबद्ध कृषि खरीद के लिए।'
              : 'Unifying farmers, procurement centres, and citizen support mechanisms on a singular digital platform for transparent, efficient, and timely agricultural procurement.'}
          </p>
        </div>
      </section>

      {/* 2. Public Service Notice Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-200 text-stone-800 flex items-start gap-3.5 shadow-xs">
          <Info className="w-5 h-5 text-[#FF9933] shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs leading-relaxed">
            <strong className="text-stone-900 font-bold block text-sm">
              {language === 'hi' ? 'महत्वपूर्ण सार्वजनिक घोषणा' : 'Important Public Notice'}
            </strong>
            <p className="text-stone-700">
              {language === 'hi'
                ? 'पैराडॉक्स एग्रीप्रोक्योर एक स्वतंत्र डिजिटल कृषि एवं किसान सेवा प्लेटफॉर्म है। यह पोर्टल भारतीय सार्वजनिक सेवा पोर्टलों की स्पष्ट, सुलभ एवं जन-हितैषी डिज़ाइन शैली से प्रेरित है, परंतु यह भारत सरकार या किसी विशिष्ट राज्य सरकार के स्वामित्व या आधिकारिकता का दावा नहीं करता है। केंद्र एवं स्लॉट की जानकारी प्रदर्शन एवं विकास उद्देश्यों के लिए प्रस्तुत की गई है।'
                : 'PARADOX AgriProcure is an independent digital agriculture and farmer-services platform. It adopts the accessible, structured, and information-oriented visual design language of public-service portals, without claiming official ownership or authorization by the Government of India or any state government. Operational centre details should be verified with local authorities.'}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-xl bg-white border border-[#D7DEE7] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-[#138808] flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#172033]">
            {language === 'hi' ? 'हमारा मिशन (Our Mission)' : 'Our Mission'}
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            {language === 'hi'
              ? 'किसानों को उनकी उपज के लिए पारदर्शी, डिजिटल व कतार-मुक्त खरीद अनुभव प्रदान करना; बिचौलियों पर निर्भरता समाप्त करना और न्यूनतम समर्थन मूल्य (MSP) का सीधा व समयबद्ध लाभ सुनिश्चित करना।'
              : 'To empower farmers with a transparent, queue-managed digital procurement process, eliminating middlemen dependencies and ensuring prompt realization of Minimum Support Price (MSP) benefits.'}
          </p>
          <ul className="space-y-2 pt-2 text-xs text-stone-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#138808]" />
              <span>{language === 'hi' ? 'कतार की स्थिति देखकर आगमन की बेहतर योजना' : 'Plan arrival using the live queue information'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#138808]" />
              <span>{language === 'hi' ? 'स्वचालित इलेक्ट्रॉनिक तौल व गुणवत्ता प्रमाणन' : 'Automated weighment and instant grading validation'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#138808]" />
              <span>{language === 'hi' ? 'पारदर्शी टोकन आवंटन प्रणाली' : 'Predictable token-based slot scheduling'}</span>
            </li>
          </ul>
        </div>

        <div className="p-8 rounded-xl bg-white border border-[#D7DEE7] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#16233B] flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#172033]">
            {language === 'hi' ? 'हमारी दूरदृष्टि (Our Vision)' : 'Our Vision'}
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            {language === 'hi'
              ? 'एक ऐसा समतामूलक डिजिटल कृषि पारिस्थितिकी तंत्र तैयार करना जहाँ भारत के प्रत्येक छोटे व सीमांत किसान को अपनी उपज बेचने, तौल कराने और भुगतान प्राप्त करने में पूर्ण सम्मान और सुविधा मिले।'
              : 'To establish an equitable digital agri-infrastructure where every small, marginal, and tenant farmer across India accesses dignified, orderly, and automated harvest procurement services.'}
          </p>
          <ul className="space-y-2 pt-2 text-xs text-stone-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF9933]" />
              <span>{language === 'hi' ? 'कॉन्फ़िगर किए गए खरीद केंद्रों की एकीकृत निर्देशिका' : 'Unified directory of configured procurement centres'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF9933]" />
              <span>{language === 'hi' ? 'प्रत्यक्ष बैंक अंतरण (DBT) से सीधा भुगतान' : 'Direct-to-bank settlement tracking'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF9933]" />
              <span>{language === 'hi' ? 'द्विभाषी व सुगम्य इंटरफेस (WCAG AA अनुपालित)' : 'Bilingual, voice-ready, and high-contrast accessible'}</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 4. How It Works (Institutional 4-Step Architecture) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="border-b border-[#D7DEE7] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-1 bg-[#138808] rounded-full" />
            <span className="text-xs font-bold tracking-widest text-[#16233B] uppercase">
              {language === 'hi' ? 'प्रक्रिया एवं संचालन' : 'Operational Workflow'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#172033] mt-1">
            {language === 'hi' ? 'डिजिटल खरीद प्रक्रिया कैसे कार्य करती है?' : 'How Digital Procurement Operates'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#D7DEE7] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#16233B] text-white font-bold flex items-center justify-center text-sm font-mono">
              01
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {language === 'hi' ? 'केंद्र का चयन' : 'Find Mandi Centre'}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {language === 'hi'
                ? 'अपने राज्य, जिले या पिन कोड के अनुसार निकटतम अधिकृत खरीद केंद्र खोजें।'
                : 'Select state and district or use GPS to locate your nearest designated APMC mandi.'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#D7DEE7] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#16233B] text-white font-bold flex items-center justify-center text-sm font-mono">
              02
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {language === 'hi' ? 'समय स्लॉट आरक्षण' : 'Reserve Time Slot'}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {language === 'hi'
                ? 'फसल की किस्म, अनुमानित वजन और वाहन विवरण दर्ज कर अपनी सुविधानुसार स्लॉट चुनें।'
                : 'Choose preferred morning, noon, or evening hours based on real-time mandi slot capacity.'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#D7DEE7] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#16233B] text-white font-bold flex items-center justify-center text-sm font-mono">
              03
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {language === 'hi' ? 'तौल एवं गुणवत्ता जाँच' : 'Weighment & Grading'}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {language === 'hi'
                ? 'टोकन लेकर केंद्र पहुंचे; इलेक्ट्रॉनिक तौल कांटा और नमी मापक से त्वरित प्रमाणन प्राप्त करें।'
                : 'Present your e-token at the weighbridge. Moisture and purity verified on certified scales.'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#D7DEE7] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#16233B] text-white font-bold flex items-center justify-center text-sm font-mono">
              04
            </div>
            <h3 className="font-bold text-stone-900 text-base">
              {language === 'hi' ? 'ई-रसीद व सीधा भुगतान' : 'E-Receipt & DBT'}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {language === 'hi'
                ? 'डिजिटल पावती पर्ची डाउनलोड करें। खरीद मूल्य सीधे आपके आधार-संबद्ध बैंक खाते में अंतरित होगा।'
                : 'Download digital receipt slip. MSP settlement credited directly to farmer bank accounts.'}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Key Pillars / Farmer Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-[#D7DEE7] p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#172033]">
              {language === 'hi' ? 'किसानों के लिए प्रमुख लाभ' : 'Core Benefits for Farmer Citizens'}
            </h2>
            <p className="text-xs text-[#64748B]">
              {language === 'hi'
                ? 'डिजिटल इंडिया एवं सुशासन के सिद्धांतों पर आधारित नागरिक सेवा सुविधाएँ'
                : 'Public-service design principles ensuring equal access across rural India'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <Clock className="w-4 h-4 text-[#FF9933]" />
                <span>{language === 'hi' ? 'शून्य अनियंत्रित कतार' : 'Predictable Queue Times'}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'hi'
                  ? 'लाइव टोकन काउंटर से जानें कि आपसे आगे कितने किसान हैं और केंद्र पर कब पहुंचना है।'
                  : 'Track how many farmers are ahead in the weighbridge line and plan your arrival.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <Scale className="w-4 h-4 text-[#138808]" />
                <span>{language === 'hi' ? 'पारदर्शी मूल्य निर्धारण' : 'Transparent MSP Accounting'}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'hi'
                  ? 'केंद्र स्तर पर सरकारी न्यूनतम समर्थन मूल्य मानकों के अनुसार पारदर्शी दर गणना।'
                  : 'Fair automated calculations aligned with national Minimum Support Price guidelines.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-[#16233B]" />
                <span>{language === 'hi' ? '3-स्तरीय शिकायत निवारण' : 'CPGRAMS / 3-Tier Grievance'}</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'hi'
                  ? 'तौल, ग्रेडिंग या भुगतान में किसी भी समस्या के लिए सीधे जिला व राज्य अधिकारियों को शिकायत भेजें।'
                  : 'Direct ticket escalation to District Procurement Officers with tracked resolution SLA.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Citizen Help & Kisan Call Centre */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 rounded-xl bg-[#0B1730] text-white space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2">
              <span className="text-[11px] font-bold text-[#FF9933] uppercase tracking-wider">
                {language === 'hi' ? '24x7 किसान सहायता एवं संपर्क' : '24x7 Citizen Farmer Support'}
              </span>
              <h3 className="text-2xl font-bold tracking-tight">
                {language === 'hi'
                  ? 'किसान कॉल सेंटर एवं हेल्पडेस्क से सहायता प्राप्त करें'
                  : 'Reach the Kisan Call Centre & Online Help Desk'}
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
                {language === 'hi'
                  ? 'स्लॉट बुकिंग, दस्तावेज़ सत्यापन, बैंक विवरण अद्यतन या तकनीकी कठिनाई के लिए टोल-फ्री नंबर 1800-180-1551 पर कॉल करें अथवा हमारे एआई किसान सहायक से तत्काल उत्तर प्राप्त करें।'
                  : 'For slot reservations, crop moisture guidelines, banking updates, or grievance filing, connect with the 24/7 toll-free helpline or chat with Kisan Sahayak.'}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href="tel:18001801551"
                className="px-5 py-3 bg-[#FF9933] hover:bg-[#e68524] text-stone-950 font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition"
              >
                <PhoneCall className="w-4 h-4 text-stone-950" />
                <span>1800-180-1551 (Toll-Free)</span>
              </a>

              <button
                type="button"
                onClick={() => onNavigate('support')}
                className="px-5 py-3 bg-[#16233B] hover:bg-[#203254] text-white border border-stone-600 font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{language === 'hi' ? 'ऑनलाइन सहायता पोर्टल खोलें' : 'Open Support Desk'}</span>
                <ArrowRight className="w-4 h-4 text-[#FF9933]" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
