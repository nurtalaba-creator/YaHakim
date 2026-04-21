import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ku';

interface Translations {
  [key: string]: {
    en: string;
    ku: string;
  };
}

export const translations: Translations = {
  appName: { en: 'Ya Hakeem', ku: 'یا حەکیم' },
  magazine: { en: 'Ya Hakeem Magazine', ku: 'گۆڤاری یا حەکیم' },
  directory: { en: 'Directory', ku: 'پێڕستی پزیشکان' },
  searchDoctors: { en: 'Search Doctors', ku: 'گەڕان بۆ پزیشک' },
  specialty: { en: 'Specialty', ku: 'پسپۆڕی' },
  location: { en: 'Location', ku: 'شوێن' },
  findDoctor: { en: 'Find a Doctor', ku: 'دۆزینەوەی پزیشک' },
  featuredArticles: { en: 'Featured Articles', ku: 'بابەتە دیارەکان' },
  readMore: { en: 'Read More', ku: 'زیاتر بخوێنەوە' },
  allSpecialties: { en: 'All Specialties', ku: 'هەموو پسپۆڕییەکان' },
  allLocations: { en: 'All Locations', ku: 'هەموو شوێنەکان' },
  doctorsFound: { en: 'Doctors Found', ku: 'پزیشک دۆزرایەوە' },
  experience: { en: 'Years Experience', ku: 'ساڵ ئەزموون' },
  contact: { en: 'Contact', ku: 'پەیوەندی' },
  about: { en: 'About', ku: 'دەربارە' },
  latestNews: { en: 'Latest Health News', ku: 'نوێترین هەواڵە تەندروستییەکان' },
  todaysDoctors: { en: "Today's Doctors", ku: 'پزیشکانی ئەمڕۆ' },
  audience: { en: 'Audience', ku: 'بەرکەوتوان' },
  symptoms: { en: 'Symptoms', ku: 'نیشانەکان' },
  patients: { en: 'For Patients', ku: 'بۆ نەخۆشەکان' },
  professionals: { en: 'For Professionals', ku: 'بۆ کەسانی پسپۆڕ' },
  importCsv: { en: 'Import Doctors (CSV)', ku: 'هێنانی پزیشکان (CSV)' },
  selectCsv: { en: 'Select CSV File', ku: 'دیاریکردنی فایلی CSV' },
  specialtyDetails: { en: 'Specialty Details', ku: 'زانیاری پسپۆڕی' },
  doctorsArticles: { en: 'Articles by this Doctor', ku: 'بابەتەکانی ئەم پزیشکە' },
  certification: { en: 'Certification', ku: 'بڕوانامە' },
  clinic: { en: 'Clinic', ku: 'کلۆینیک' },
  workdays: { en: 'Workdays', ku: 'ڕۆژانی دەوام' },
  fee: { en: 'Consultation Fee', ku: 'نرخی بینین' },
  sourceLink: { en: 'Source Link', ku: 'لینکی سەرچاوە' },
  magazineTitle: { en: 'Ya Hakeem Magazine', ku: 'گۆڤاری یا حەکیم' },
  latestArticles: { en: 'Latest Articles', ku: 'نوێترین بابەتەکان' },
  allTopics: { en: 'All Topics', ku: 'هەموو بابەتەکان' },
  fullArticle: { en: 'Full Article', ku: 'تەواوی بابەتەکە' },
  goToMagazine: { en: 'Go to Magazine', ku: 'بڕۆ بۆ گۆڤار' },
  goToDirectory: { en: 'Go to Directory', ku: 'بڕۆ بۆ پێڕست' },
  providers: { en: 'Providers', ku: 'پزیشک' },
  selectCity: { en: 'Select City', ku: 'شارەکەت هەڵبژێرە' },
  rania: { en: 'Rania', ku: 'ڕانیە' },
  halabja: { en: 'Halabja', ku: 'هەڵەبجە' },
  erbil: { en: 'Erbil', ku: 'هەولێر' },
  sulaymaniyah: { en: 'Sulaymaniyah', ku: 'سلێمانی' },
  duhok: { en: 'Duhok', ku: 'دهۆک' },
  qalladza: { en: 'Qalladza', ku: 'قەڵادزێ' },
  kirkuk: { en: 'Kirkuk', ku: 'کەرکوک' },
  kalar: { en: 'Kalar', ku: 'کەلار' },
  soran: { en: 'Soran', ku: 'سۆران' },
  zakho: { en: 'Zakho', ku: 'زاخۆ' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ku'); // Default to Kurdish

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  const isRtl = language === 'ku';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
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
