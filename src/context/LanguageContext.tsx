import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('paradox_lang');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('paradox_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'hi') {
      document.body.classList.add('lang-hi');
    } else {
      document.body.classList.remove('lang-hi');
    }
  }, [language]);

  const t = (path: string, fallback?: string): string => {
    const currentDict = language === 'hi' ? hiTranslations : enTranslations;
    const enDict = enTranslations;

    const keys = path.split('.');
    
    // Attempt lookup in current dictionary
    let value: any = currentDict;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        value = undefined;
        break;
      }
    }

    if (typeof value === 'string') {
      return value;
    }

    // Fallback to English dictionary
    let fallbackVal: any = enDict;
    for (const key of keys) {
      if (fallbackVal && typeof fallbackVal === 'object' && key in fallbackVal) {
        fallbackVal = fallbackVal[key];
      } else {
        fallbackVal = undefined;
        break;
      }
    }

    if (typeof fallbackVal === 'string') {
      return fallbackVal;
    }

    return fallback || path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
