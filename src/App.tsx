import React, { useState, useEffect, useMemo } from 'react';
import { LanguageProvider, useLanguage } from './lib/LanguageContext';
import { Search, MapPin, Stethoscope, BookOpen, Globe, User, LayoutDashboard, ChevronRight, Menu, X, Plus, Edit2, Trash2, Save, ChevronDown, ChevronUp, Bell, Home, Info, Filter, ArrowRight, Sun, Moon, Calendar, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { SPECIALTIES } from './constants/specialties';
import { DOCTORS_SEED } from './constants/seedData';
import { dataService, type Doctor, type Article } from './lib/dataService';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

// --- Types ---
// Interface definitions moved to dataService.ts

// --- Mock Data ---
const MOCK_DOCTORS: Doctor[] = [
  { id: '1', name_en: 'Dr. Dler Karim Mohammed', name_ku: 'دکتۆر دلێر کەریم محمد', specialty_en: 'Ophthalmology', specialty_ku: 'نەشتەرگەری چاو', clinic_ku: 'سەنتەری چاوی هەڵەبجە', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '07501067369', experience: 15, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '2', name_en: 'Dr. Ramyar Abdullah', name_ku: 'دکتۆر رامیار عبداللە', specialty_en: 'Ophthalmology', specialty_ku: 'نەشتەرگەری چاو', clinic_ku: 'سەنتەری چاوی هەڵەبجە', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '07501067369', experience: 12, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '3', name_en: 'Dr. Goran Mohammed', name_ku: 'دکتۆر گۆران محمد', specialty_en: 'Dermatology', specialty_ku: 'پێست', clinic_ku: 'سەنتەری پێست و جوانکاری د.گۆران محمد', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '07501309891', experience: 10, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '4', name_en: 'Dr. Vian Hiwa Hawrani', name_ku: 'دکتۆرە ڤیان هیوا هەورامی', specialty_en: 'General Surgery', specialty_ku: 'نەشتەرگەری گشتی', clinic_ku: 'سەنتەری پێست و جوانکاری', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '07501309891', experience: 14, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '5', name_en: 'Dr. Basoz Younis Aziz', name_ku: 'دکتۆر بەسۆز یونس عزیز', specialty_en: 'Dentistry', specialty_ku: 'دەم و ددان', clinic_ku: 'Amez Dental Health', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '07511861828', experience: 8, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '7', name_en: 'Dr. Huda Ahmed Rashid', name_ku: 'دکتۆرە هدی أحمد رشید', specialty_en: 'Gynecology', specialty_ku: 'ژنان و مناڵبوون', clinic_ku: 'تەلاری پزیشکی ئایندە', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '7501545000', experience: 15, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '8', name_en: 'Dr. Rebwar Faraj Baweisi', name_ku: 'دکتۆر ڕێبوار فەرەج باوەیسی', specialty_en: 'Internal Medicine', specialty_ku: 'هەناوی', clinic_ku: 'تەلاری پزیشکی ئایندە', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '07501878535', experience: 18, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '9', name_en: 'Dr. Bawan Mohammed Amin', name_ku: 'دکتۆر باوان محمد امین بارام کۆکۆیی', specialty_en: 'Orthopedics', specialty_ku: 'ئێسک و شکاوی', clinic_ku: 'تەلاری پزیشکی ئایندە', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '07728248181', experience: 12, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '10', name_en: 'Dr. Bakhan Omar Karim', name_ku: 'دکتۆرە باخان عمر کریم', specialty_en: 'ENT', specialty_ku: 'قوڕگ و لوت و گوێ', clinic_ku: 'تەلاری پزیشکی ئایندە', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '07703321001', experience: 10, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '12', name_en: 'Dr. Irfan Ahmed Rashid', name_ku: 'دکتۆر عیرفان احمد رشید', specialty_en: 'Radiology', specialty_ku: 'تیشک و سۆنار', clinic_ku: 'تەلاری پزیشکی ئایندە', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '7501984069', experience: 15, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '21', name_en: 'Dr. Aso Khosrow Ahmed', name_ku: 'دکتۆر ئاسۆ خسرو احمد', specialty_en: 'ENT', specialty_ku: 'قوڕگ و لوت و گوێ', clinic_ku: 'کۆمەڵگەی پزیشکی بەخشین', location_en: 'Halabja', location_ku: 'هەڵەبجە', contact: '07511817571', experience: 20, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '94', name_en: 'Dr. Faraidun Adnan Barzanji', name_ku: 'د. فەرەیدوون عەدنان بەرزنجی', specialty_en: 'Orthopedics', specialty_ku: 'ئێسک و شکاوی', clinic_ku: 'کلینیکی پزیشکی ئاشتی', location_en: 'Rania', location_ku: 'ڕانیە', contact: '07501403816', experience: 15, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '95', name_en: 'Dr. Ali Hamza Hussain', name_ku: 'د. علی همزە حسین', specialty_en: 'Pediatrics', specialty_ku: 'مناڵان و تازە لەدایکبووان', clinic_ku: 'کلینیکی پزیشکی ئاشتی', location_en: 'Rania', location_ku: 'ڕانیە', contact: '07707798302', experience: 10, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '96', name_en: 'Dr. Zana Maruf Shikhani', name_ku: 'د. زانا مەعروف شێخانی', specialty_en: 'Urology', specialty_ku: 'میزەڕۆ و گورچیلە', clinic_ku: 'کلینیکی پزیشکی ئاشتی', location_en: 'Rania', location_ku: 'ڕانیە', contact: '07509301301', experience: 18, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '115', name_en: 'Dr. Behzad Wsu Hamad Beg', name_ku: 'د. بەهزاد وسو حمد بەگ', specialty_en: 'General Surgery', specialty_ku: 'نەشتەرگەری گشتی', clinic_ku: 'کۆمەڵگەی پزیشکی هەنوو', location_en: 'Rania', location_ku: 'ڕانیە', contact: '07711431414', experience: 22, availableToday: true, bio_en: '', bio_ku: '' },
  { id: '127', name_en: 'Dr. Bahoz Aziz Taha', name_ku: 'د. باهۆز عزیز طە (بەرزنجی)', specialty_en: 'Cardiology', specialty_ku: 'دڵ و قەستەرە', clinic_ku: 'کلینیکی پزیشکی نۆڤین', location_en: 'Rania', location_ku: 'ڕانیە', contact: '07512721818', experience: 10, availableToday: true, bio_en: '', bio_ku: '' },
];

const MOCK_DOCTORS_OLD: Doctor[] = [];

const MOCK_ARTICLES: Article[] = [
  { id: '1', title_en: 'Understanding Hypertension', title_ku: 'تێگەیشتن لە پەستانی خوێن', category_en: 'Cardiology', category_ku: 'دڵ و دەمار', audience_en: 'Patients', audience_ku: 'نەخۆشەکان', symptoms_en: ['Headache', 'Dizziness'], symptoms_ku: ['سەرئێشە', 'گێژبوون'], author: 'Dr. Aryan', imageUrl: 'https://picsum.photos/seed/heart1/800/400', content_en: 'Hypertension, also known as high blood pressure, is a condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease. Blood pressure is determined both by the amount of blood your heart pumps and the amount of resistance to blood flow in your arteries. The more blood your heart pumps and the narrower your arteries, the higher your blood pressure.', content_ku: 'پەستانی خوێنی بەرز بارودۆخێکە کە تێیدا هێزی خوێن بەرامبەر بە دیوارەکانی خوێنبەرەکان سست دەبێت و دەبێتە هۆی کێشەی تەندروستی. پەستانی خوێن بە بڕی ئەو خوێنەی دڵ دەیپاڵێوێت و بڕی بەرگری بەرامبەر بە سووڕانی خوێن لە خوێنبەرەکاندا دیاری دەکرێت.', publishedAt: '2026-04-20' },
  { id: '2', title_en: 'Skincare Routine for Beginners', title_ku: 'شێوازی گرنگیدان بە پێست', category_en: 'Dermatology', category_ku: 'پێست', audience_en: 'Patients', audience_ku: 'نەخۆشەکان', symptoms_en: ['Dryness', 'Acne'], symptoms_ku: ['وشکی', 'زیپکە'], author: 'Dr. Karwan', imageUrl: 'https://picsum.photos/seed/skin1/800/400', content_en: 'A basic skincare routine involves cleansing, moisturizing, and sun protection. Understanding your skin type—whether it is oily, dry, or combination—is the first step in choosing the right products.', content_ku: 'گرنگیدان بە پێست بریتییە لە پاککەرەوە، شێدارکەرەوە، و پاراستن لە خۆر. تێگەیشتن لە جۆری پێستت هەنگاوی یەکەمە بۆ هەڵبژاردنی بەرهەمە گونجاوەکان.', publishedAt: '2026-04-18' },
  { id: '3', title_en: 'Importance of Childhood Vaccines', title_ku: 'گرنگی کوتانی منداڵان', category_en: 'Pediatrics', category_ku: 'منداڵان', audience_en: 'Patients', audience_ku: 'نەخۆشەکان', symptoms_en: ['None'], symptoms_ku: ['نییە'], author: 'Dr. Mohammed', imageUrl: 'https://picsum.photos/seed/child1/800/400', content_en: 'Vaccines are a critical part of pediatrics. They protect children from serious and potentially fatal diseases.', content_ku: 'کوتان بەشێکی گرنگی پزیشکی منداڵانە. منداڵان دەپارێزێت لە نەخۆشییە مەترسیدارەکان.', publishedAt: '2026-04-15' },
];

// --- Components ---

function AppContent() {
  const { t, language, setLanguage, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'directory' | 'magazine' | 'cms'>('directory');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string>('Rania');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [magazineSpecialty, setMagazineSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [allExpanded, setAllExpanded] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isBarsVisible, setIsBarsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const handleGlobalScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsBarsVisible(false);
      } else {
        setIsBarsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleGlobalScroll);
    return () => window.removeEventListener('scroll', handleGlobalScroll);
  }, [lastScrollY]);

  // Simple hash-based routing for admin
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setActiveTab('cms');
      }
    };
    window.addEventListener('hashchange', checkHash);
    checkHash();
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Apply theme to document element to ensure background colors are consistent
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [isLocationSheetOpen, setIsLocationSheetOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  // Auth & Data Initialization
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    const initData = async () => {
      try {
        const [fetchedDoctors, fetchedArticles] = await Promise.all([
          dataService.getDoctors(),
          dataService.getArticles()
        ]);

        setDoctors(fetchedDoctors);
        setArticles(fetchedArticles);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
    return () => unsub();
  }, []);

  // Separate effect for seeding once user session is active
  useEffect(() => {
    const seedIfEmpty = async () => {
      if (user && doctors.length === 0 && articles.length === 0 && !isLoading) {
        console.log("Seeding initial data...");
        try {
          // Import from Seed Data
          for (const d of DOCTORS_SEED) {
            await dataService.addDoctor(d);
          }
          for (const a of MOCK_ARTICLES) {
            const { id, ...rest } = a;
            await dataService.addArticle(rest);
          }
          // Re-fetch after seeding
          const [dSet, aSet] = await Promise.all([
            dataService.getDoctors(),
            dataService.getArticles()
          ]);
          setDoctors(dSet);
          setArticles(aSet);
        } catch (err) {
          console.error("Seeding failed:", err);
        }
      }
    };
    seedIfEmpty();
  }, [user, doctors.length, articles.length, isLoading]);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        // In a real app, we'd reverse geocode here. 
        // For now, we'll keep the manual selector but prioritize GPS if available in logic.
      }, (err) => {
        console.warn("GPS Access Denied:", err.message);
      });
    }
  }, []);

  const specialties = useMemo(() => {
    const staticNames = SPECIALTIES.map(s => language === 'en' ? s.name_en : s.name_ku);
    const dynamicNames = doctors.map(d => language === 'en' ? d.specialty_en : d.specialty_ku);
    const magazineDynamicNames = articles.map(a => language === 'en' ? a.category_en : a.category_ku);
    
    // Combine and unique
    const all = Array.from(new Set([...staticNames, ...dynamicNames, ...magazineDynamicNames]));
    
    // Filter out empty strings and sort
    return all.filter(s => s && s.trim() !== '' && s !== 'General').sort((a, b) => a.localeCompare(b));
  }, [language, doctors, articles]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin" />
           <p className="text-xs font-black text-teal-600 uppercase tracking-widest animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme} min-h-screen flex flex-col font-sans bg-white dark:bg-slate-950 transition-colors duration-300 ${isRtl ? 'rtl' : 'ltr text-slate-800 dark:text-slate-200'}`}>
      
      <header 
        className="h-14 px-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 z-50 transition-colors fixed top-0 left-0 right-0"
      >
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 text-slate-500 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu size={18} />
          </button>
          <button 
            onClick={() => {
              setActiveTab('directory');
              setMagazineSpecialty(null);
            }}
            className="text-lg font-black tracking-tighter text-slate-900 dark:text-white"
          >
            {language === 'en' ? 'YA HAKEEM' : 'یا حەکیم'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <button onClick={() => setIsSearchOpen(true)} className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors">
            <Search size={18} />
          </button>
          
          <div className="flex bg-slate-50 dark:bg-slate-900 rounded-lg p-0.5 border border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 text-[10px] font-black rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('ku')}
              className={`px-2 py-0.5 text-[10px] font-black rounded-md transition-all ${language === 'ku' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400'}`}
            >
              KU
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex relative pt-20 pb-24 min-h-0">
        
        {/* Mobile Sidebar (Specialties) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60] md:hidden"
              />
              <motion.aside 
                initial={{ x: isRtl ? '100' : '-100' }} animate={{ x: 0 }} exit={{ x: isRtl ? '100' : '-100' }}
                className={`absolute top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} w-72 bg-white dark:bg-slate-900 z-[70] md:hidden flex flex-col shadow-2xl transition-colors`}
              >
                <div className="h-14 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400"></span>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={18}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
                  <button 
                    onClick={() => {
                      if (activeTab === 'directory') setSelectedSpecialty(null);
                      else setMagazineSpecialty(null);
                      setSearchQuery('');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${isRtl ? 'text-right' : 'text-left'} ${(activeTab === 'directory' ? !selectedSpecialty && !searchQuery : !magazineSpecialty && !searchQuery) ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                       <Home size={16} />
                       {activeTab === 'directory' ? t('allSpecialties') : t('allTopics')}
                    </div>
                  </button>
                  {activeTab === 'directory' && (
                    <button 
                      onClick={() => {
                        setSelectedSpecialty('Today');
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${isRtl ? 'text-right' : 'text-left'} ${selectedSpecialty === 'Today' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                         <Calendar size={16} />
                         {t('todaysDoctors')}
                      </div>
                    </button>
                  )}
                  {activeTab === 'magazine' && (
                    <button 
                      onClick={() => {
                        setMagazineSpecialty('Latest');
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${isRtl ? 'text-right' : 'text-left'} ${magazineSpecialty === 'Latest' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                         <Bell size={16} />
                         {t('latestArticles')}
                      </div>
                    </button>
                  )}
                  {specialties.map(s => (
                    <button 
                      key={s}
                      onClick={() => {
                        if (activeTab === 'directory') setSelectedSpecialty(s);
                        else setMagazineSpecialty(s);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full px-4 py-3 rounded-xl text-sm font-bold transition-all ${isRtl ? 'text-right' : 'text-left'} ${(activeTab === 'directory' ? selectedSpecialty === s : magazineSpecialty === s) ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Side Panel (Specialties) - Compact Nav (Desktop Only) */}
        {(activeTab === 'directory' || activeTab === 'magazine') && (
          <aside className={`w-48 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800 flex-col hidden md:flex shrink-0 transition-colors fixed top-14 bottom-14 overflow-y-auto ${isRtl ? 'right-0 border-l border-r-0' : 'left-0'}`}>
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              <h3 className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"></h3>
              <button 
                onClick={() => {
                  if (activeTab === 'directory') setSelectedSpecialty(null);
                  else setMagazineSpecialty(null);
                  setSearchQuery('');
                }}
                className={`w-full text-start px-3 py-2 rounded-lg text-xs font-bold transition-all ${(activeTab === 'directory' ? !selectedSpecialty && !searchQuery : !magazineSpecialty && !searchQuery) ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800'}`}
              >
                <div className="flex items-center gap-2">
                   <Home size={14} />
                   {activeTab === 'directory' ? t('allSpecialties') : t('allTopics')}
                </div>
              </button>
              {activeTab === 'directory' && (
                <button 
                  onClick={() => setSelectedSpecialty('Today')}
                  className={`w-full text-start px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedSpecialty === 'Today' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 shadow-sm border border-rose-100 dark:border-rose-900/50' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {t('todaysDoctors')}
                  </div>
                </button>
              )}
              {activeTab === 'magazine' && (
                <button 
                  onClick={() => setMagazineSpecialty('Latest')}
                  className={`w-full text-start px-3 py-2 rounded-lg text-xs font-bold transition-all ${magazineSpecialty === 'Latest' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 shadow-sm border border-orange-100 dark:border-orange-900/50' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-2">
                    <Bell size={14} />
                    {t('latestArticles')}
                  </div>
                </button>
              )}
              <div className="h-px bg-slate-200/50 dark:bg-slate-800/50 my-2" />
              {specialties.map(s => (
                <button 
                  key={s}
                  onClick={() => {
                    if (activeTab === 'directory') setSelectedSpecialty(s);
                    else setMagazineSpecialty(s);
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-bold transition-all ${isRtl ? 'text-right' : 'text-left'} ${(activeTab === 'directory' ? selectedSpecialty === s : magazineSpecialty === s) ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-sm border border-slate-100 dark:border-slate-800' : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Main Content Space-taker for Fixed Header */}
        <div className="h-14 shrink-0" />
        
        {/* Spacer for Fixed Side Panel on Desktop */}
        {(activeTab === 'directory' || activeTab === 'magazine') && (
          <div className="hidden md:block w-48 shrink-0" />
        )}

        <main className="flex-1 relative bg-white dark:bg-slate-950 transition-colors">
          <AnimatePresence mode="wait">
            {activeTab === 'directory' ? (
              <motion.div 
                key="dir" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-5xl mx-auto"
              >
                <DirectorySection 
                  doctors={doctors}
                  setSelectedDoctor={setSelectedDoctor} 
                  userCity={userCity} 
                  setUserCity={setUserCity}
                  selectedSpecialty={selectedSpecialty}
                  allExpanded={allExpanded}
                  setAllExpanded={setAllExpanded}
                  searchQuery={searchQuery}
                  setActiveTab={setActiveTab}
                  setMagazineSpecialty={setMagazineSpecialty}
                  setIsLocationSheetOpen={setIsLocationSheetOpen}
                />
              </motion.div>
            ) : activeTab === 'magazine' ? (
              <motion.div 
                key="mag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-5xl mx-auto"
              >
                <MagazineSection 
                  articles={articles}
                  activeSpecialty={magazineSpecialty}
                  setActiveSpecialty={setMagazineSpecialty}
                  setSelectedArticle={setSelectedArticle}
                  allExpanded={allExpanded}
                  setAllExpanded={setAllExpanded}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setActiveTab={setActiveTab}
                  setSelectedDoctor={setSelectedDoctor}
                  setSelectedSpecialty={setSelectedSpecialty}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="cms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-5xl mx-auto w-full"
              >
                <CMSSection 
                  setDoctors={setDoctors} 
                  setArticles={setArticles}
                  isImporting={isImporting}
                  setIsImporting={setIsImporting}
                  importProgress={importProgress}
                  setImportProgress={setImportProgress}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 z-[60] bg-white dark:bg-slate-950 p-6 flex flex-col items-center transition-colors"
            >
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="w-full max-w-xl mt-12 space-y-8">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsSearchOpen(false)}
                    placeholder="Search doctors or articles..." 
                    className="w-full pl-10 pr-4 py-3 text-lg bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-1 focus:ring-teal-500 dark:text-white transition-colors"
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                   {['Checkup', 'Fever', 'Skin', 'Heart'].map(tag => (
                     <button 
                        key={tag}
                        onClick={() => { setSearchQuery(tag); setIsSearchOpen(false); }}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-full text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest"
                      >
                       {tag}
                     </button>
                   ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Doctor Details - More Compact */}
        <AnimatePresence>
          {selectedDoctor && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedDoctor(null)}
                className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/20 backdrop-blur-[2px] z-[70]"
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-2xl z-[80] flex flex-col max-h-[90vh] transition-colors"
              >
                <div className="p-6 overflow-y-auto">
                  <div className="flex gap-6 flex-col sm:flex-row">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{language === 'en' ? selectedDoctor.name_en : selectedDoctor.name_ku}</h2>
                          <p className="text-sm text-teal-600 font-bold">{language === 'en' ? selectedDoctor.specialty_en : selectedDoctor.specialty_ku}</p>
                        </div>
                        <button onClick={() => setSelectedDoctor(null)} className="p-1 text-slate-300 hover:text-slate-900 dark:hover:text-white"><X size={18} /></button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-50 dark:border-slate-700">
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">{t('location')}</label>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === 'en' ? selectedDoctor.location_en : selectedDoctor.location_ku}</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-50 dark:border-slate-700">
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">{t('experience')}</label>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedDoctor.experience}y</p>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-50 dark:border-slate-700">
                          <label className="text-[9px] font-black uppercase text-slate-400 block mb-0.5">Fee</label>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedDoctor.fee || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-teal-50/30 dark:bg-teal-900/10 rounded-lg border border-teal-50 dark:border-teal-900/30">
                         <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                           {language === 'en' ? selectedDoctor.bio_en : selectedDoctor.bio_ku}
                         </p>
                      </div>
                      
                      {/* Doctor's Latest Articles */}
                      <div className="mt-8 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                           <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Latest from this provider</h4>
                           <button 
                             onClick={() => {
                               setSearchQuery(selectedDoctor.name_en.split(' ')[1] || selectedDoctor.name_en);
                               setActiveTab('magazine');
                               setSelectedDoctor(null);
                             }}
                             className="text-[10px] font-black text-teal-600 uppercase hover:underline"
                           >
                             View All
                           </button>
                        </div>
                        <div className="space-y-3">
                          {articles.filter(a => a.author.includes(selectedDoctor.name_en.split(' ')[1] || selectedDoctor.name_en)).slice(0, 3).map(art => (
                            <div 
                              key={art.id} onClick={() => { setSelectedArticle(art); setSelectedDoctor(null); }}
                              className="flex gap-4 cursor-pointer group"
                            >
                              <div className="w-16 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                <img src={art.imageUrl} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-600 transition-colors">
                                  {language === 'en' ? art.title_en : art.title_ku}
                                </h5>
                                <p className="text-[9px] text-slate-400 uppercase tracking-tighter mt-0.5">{art.publishedAt}</p>
                              </div>
                            </div>
                          ))}
                          {articles.filter(a => a.author.includes(selectedDoctor.name_en.split(' ')[1] || selectedDoctor.name_en)).length === 0 && (
                            <p className="text-[10px] text-slate-400 italic">No published articles yet.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-8 pb-4">
                        <button className="flex-1 btn-dark py-3.5 text-xs bg-slate-900 dark:bg-white dark:text-slate-900">{isRtl ? 'پەیوەندی بکە' : 'Make Appointment'}</button>
                        <button className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">Maps</button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Article Details Bottom Sheet */}
        <AnimatePresence>
          {selectedArticle && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedArticle(null)}
                className="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/30 backdrop-blur-[2px] z-[70]"
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 shadow-2xl z-[80] flex flex-col h-[60vh] transition-colors"
              >
                <div className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase text-teal-600 tracking-widest">{language === 'en' ? selectedArticle.category_en : selectedArticle.category_ku}</span>
                  <button onClick={() => setSelectedArticle(null)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={18}/></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                   <div className="max-w-3xl mx-auto p-6 space-y-8">
                      <h2 className="text-3xl font-black font-arabic leading-tight text-slate-900 dark:text-white tracking-tighter">
                         {language === 'en' ? selectedArticle.title_en : selectedArticle.title_ku}
                      </h2>
                      <div className="flex items-center gap-4 py-4 border-y border-slate-50 dark:border-slate-900">
                         <button 
                           onClick={() => {
                             const doctor = doctors.find(d => d.name_en.includes(selectedArticle.author) || d.name_ku.includes(selectedArticle.author));
                             if (doctor) {
                               setSelectedDoctor(doctor);
                               setSelectedArticle(null);
                             }
                           }}
                           className="flex items-center gap-3 hover:text-teal-600 transition-colors"
                         >
                           <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-black text-[10px]">{selectedArticle.author[0]}</div>
                           <div>
                              <span className="block text-xs font-black text-slate-900 dark:text-white">{selectedArticle.author}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{selectedArticle.publishedAt}</span>
                           </div>
                         </button>
                      </div>
                      <div className="prose dark:prose-invert prose-slate max-w-none">
                         <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                            {language === 'en' ? selectedArticle.content_en.substring(0, 200) : selectedArticle.content_ku.substring(0, 200)}...
                         </p>
                         <div className="pt-6">
                            <button 
                              onClick={() => {
                                // For now, just expand or simulate full article
                                window.open('#', '_blank');
                              }}
                              className="text-xs font-black uppercase text-teal-600 hover:underline flex items-center gap-1"
                            >
                               {t('fullArticle')} <ArrowRight size={14} />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLocationSheetOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsLocationSheetOpen(false)}
                className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[120]"
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 z-[130] rounded-t-[32px] p-6 shadow-2xl transition-colors"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-center uppercase tracking-tight">
                  {t('selectCity')}
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {['Halabja', 'Rania', 'Qalladza', 'Erbil', 'Sulaymaniyah', 'Duhok'].map((city) => (
                    <button 
                      key={city}
                      onClick={() => {
                        setUserCity(city);
                        setIsLocationSheetOpen(false);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${userCity === city ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400' : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <MapPin size={20} className={userCity === city ? 'text-teal-500' : 'text-slate-300'} />
                      <span className="text-sm font-bold uppercase">{t(city.toLowerCase())}</span>
                    </button>
                  ))}
                  <button 
                    onClick={() => {
                      if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          setIsLocationSheetOpen(false);
                          alert(language === 'en' ? "Location updated by GPS" : "شوێنەکە لە ڕێگەی GPS نوێکرایەوە");
                        });
                      }
                    }}
                    className="col-span-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Globe size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{language === 'en' ? 'Detect GPS Location' : 'دیاریکردنی شوێن بە GPS'}</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs Bar - Fixed and Centered */}
      <motion.nav 
        animate={{ y: isBarsVisible ? 0 : 100 }}
        className="h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex fixed bottom-0 left-0 right-0 z-[100] transition-colors shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
      >
        <div className="w-full flex items-stretch">
          <button 
            onClick={() => {
               setActiveTab('directory');
               window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${activeTab === 'directory' ? 'text-teal-600' : 'text-slate-400'}`}
          >
            <Stethoscope size={20} fill={activeTab === 'directory' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-black uppercase tracking-tighter text-center w-full">{t('directory')}</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('magazine');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-all ${activeTab === 'magazine' ? 'text-teal-600' : 'text-slate-400'}`}
          >
            <BookOpen size={20} fill={activeTab === 'magazine' ? 'currentColor' : 'none'} />
            <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-[1.1] w-full">
              {language === 'en' ? (
                <>
                  <span className="block">Ya Hakeem</span>
                  <span className="block">Magazine</span>
                </>
              ) : (
                t('magazine')
              )}
            </span>
          </button>
        </div>
      </motion.nav>
    </div>
  );
}

function DirectorySection({ doctors, setSelectedDoctor, userCity, setUserCity, selectedSpecialty, allExpanded, setAllExpanded, searchQuery, setActiveTab, setMagazineSpecialty, setIsLocationSheetOpen }: any) {
  const { t, language } = useLanguage();
  const [openSpecialty, setOpenSpecialty] = useState<string | null>(null);
  const [openTodaySpecialty, setOpenTodaySpecialty] = useState<string | null>(null);

  const activeSpecData = useMemo(() => {
    return SPECIALTIES.find(s => s.name_en === selectedSpecialty || s.name_ku === selectedSpecialty);
  }, [selectedSpecialty]);

  const filteredDoctors = useMemo(() => {
    let filtered = doctors.filter((d: Doctor) => d.location_en === userCity || d.location_ku === userCity);
    if (searchQuery) {
      filtered = filtered.filter((d: Doctor) => 
        d.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.name_ku.includes(searchQuery)
      );
    }
    return filtered;
  }, [userCity, searchQuery, doctors]);

  const todaysDoctorsBySpecialty = useMemo(() => {
    const groups: Record<string, Doctor[]> = {};
    filteredDoctors.filter(d => d.availableToday).forEach(doc => {
      const spec = language === 'en' ? doc.specialty_en : doc.specialty_ku;
      if (!groups[spec]) groups[spec] = [];
      groups[spec].push(doc);
    });
    return groups;
  }, [filteredDoctors, language]);

  const doctorsBySpecialty = useMemo(() => {
    const groups: Record<string, Doctor[]> = {};
    filteredDoctors.forEach(doc => {
      const spec = language === 'en' ? doc.specialty_en : doc.specialty_ku;
      if (!groups[spec]) groups[spec] = [];
      groups[spec].push(doc);
    });
    
    // Sort according to SPECIALTIES order
    const sortedGroups: Record<string, Doctor[]> = {};
    SPECIALTIES.forEach(spec => {
      const name = language === 'en' ? spec.name_en : spec.name_ku;
      if (groups[name]) {
        sortedGroups[name] = groups[name];
      }
    });
    
    // Add any specs not in the constant list
    Object.keys(groups).forEach(name => {
      if (!sortedGroups[name]) sortedGroups[name] = groups[name];
    });
    
    return sortedGroups;
  }, [filteredDoctors, language]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Search / City Row */}
      <div className="flex items-center justify-between gap-4 sticky top-14 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-20 py-2 -mx-4 px-4 border-b border-slate-100 dark:border-slate-800 md:relative md:top-auto md:bg-transparent md:backdrop-blur-none md:border-none md:px-0 md:mx-0">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase shrink-0">{t('directory')}</h1>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {!selectedSpecialty && (
            <button 
              onClick={() => setAllExpanded(!allExpanded)}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-teal-600 transition-colors whitespace-nowrap"
            >
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )}
          <button 
            onClick={() => setIsLocationSheetOpen(true)}
            className="flex items-center gap-2 text-[10px] font-bold bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-teal-500 transition-all whitespace-nowrap"
          >
            <MapPin size={12} className="text-teal-600" />
            <span className="uppercase font-black text-slate-900 dark:text-white">{t(userCity.toLowerCase())}</span>
          </button>
        </div>
      </div>

      {/* Specialty Header Page (if selected) */}
      {selectedSpecialty && selectedSpecialty !== 'Today' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-slate-900 dark:bg-slate-800/50 rounded-2xl text-white space-y-4 shadow-xl mb-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-teal-400 font-arabic">{selectedSpecialty}</h2>
            <button 
              onClick={() => {
                setActiveTab('magazine');
                setMagazineSpecialty(selectedSpecialty);
              }}
              className="flex items-center gap-2 text-[10px] font-black uppercase bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all"
            >
              {t('goToMagazine')} <ArrowRight size={14} />
            </button>
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
             {activeSpecData ? (language === 'en' ? activeSpecData.description_en : activeSpecData.description_ku) : `Browse leading specialists in ${selectedSpecialty} and expert healthcare providers in ${userCity}.`}
          </p>
        </motion.div>
      )}

      {/* Today's Doctors section - Only show if specifically on "Today" OR no specialty selected AND searching */}
      {((selectedSpecialty === 'Today' && !searchQuery) || (!selectedSpecialty && searchQuery && Object.keys(todaysDoctorsBySpecialty).length > 0)) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-black text-teal-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                {t('todaysDoctors')}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">
                {new Date().toLocaleDateString(language === 'en' ? 'en-GB' : 'ku-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {selectedSpecialty === 'Today' && (
              <button 
                onClick={() => setAllExpanded(!allExpanded)}
                className="text-[9px] font-black uppercase text-slate-400 hover:text-teal-600"
              >
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            )}
          </div>
          <div className="space-y-1">
            {Object.entries(todaysDoctorsBySpecialty).map(([spec, docs]) => (
              <div key={`today-${spec}`} className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white/50 dark:bg-slate-900/30 transition-colors">
                <button 
                  onClick={() => setOpenTodaySpecialty(openTodaySpecialty === spec ? null : spec)}
                  className={`w-full flex items-center justify-between py-3.5 px-4 transition-colors ${openTodaySpecialty === spec ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-teal-500 rounded-full" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{spec}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">{(docs as Doctor[]).length} {t('providers')}</span>
                </button>
                <AnimatePresence>
                  {(openTodaySpecialty === spec || allExpanded) && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="py-2 px-2 grid grid-cols-1 gap-1.5 border-t border-slate-50 dark:border-slate-700/50">
                        {(docs as Doctor[]).map(doc => (
                          <div key={doc.id} onClick={() => setSelectedDoctor(doc)} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                            <div className="flex-1">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">{language === 'en' ? doc.name_en : doc.name_ku}</h5>
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[9px] font-medium text-slate-500 flex items-center gap-1 uppercase">
                                   <Home size={10} className="text-teal-600" />
                                   {language === 'en' ? doc.clinic_en || 'Private Clinic' : doc.clinic_ku || 'کلینیکی تایبەت'}
                                 </span>
                                 <span className="text-[10px] font-black text-teal-600 flex items-center gap-1">
                                   <Search size={10} />
                                   {doc.contact}
                                 </span>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Specialty Groups */}
      {selectedSpecialty !== 'Today' && (
        <section className="space-y-1">
          {Object.entries(doctorsBySpecialty)
            .filter(([spec]) => !selectedSpecialty || spec === selectedSpecialty)
            .map(([specialty, docs]) => (
            <div key={specialty} className="bg-white dark:bg-transparent transition-colors mb-2">
              {!selectedSpecialty && (
                <button 
                  onClick={() => setOpenSpecialty(openSpecialty === specialty ? null : specialty)}
                  className={`w-full py-4 px-4 flex items-center justify-between group rounded-xl transition-all ${openSpecialty === specialty ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700' : 'bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-teal-500 rounded-full" />
                    <div className="text-start">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{specialty}</h4>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{(docs as Doctor[]).length} {t('providers')}</p>
                    </div>
                  </div>
                  {(openSpecialty === specialty || allExpanded) ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
              )}
              
              <AnimatePresence>
                {(openSpecialty === specialty || selectedSpecialty === specialty || allExpanded) && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 px-2">
                      {(docs as Doctor[]).map(doc => (
                        <div 
                          key={doc.id} onClick={() => setSelectedDoctor(doc)}
                          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-teal-100 dark:hover:border-teal-900 hover:shadow-md transition-all shadow-sm"
                        >
                          <div className="flex-1">
                            <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-tight mb-2">{language === 'en' ? doc.name_en : doc.name_ku}</h5>
                            <div className="space-y-1">
                               <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                                 <Home size={12} className="text-teal-600 shrink-0" />
                                 <span className="truncate">{language === 'en' ? doc.clinic_en || 'Private Clinic' : doc.clinic_ku || 'کلینیکی تایبەت'}</span>
                               </div>
                               <div className="flex items-center gap-2 text-[11px] font-black text-teal-600">
                                 <Search size={12} className="shrink-0" />
                                 {doc.contact}
                               </div>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all text-slate-300 dark:text-slate-600">
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function MagazineSection({ articles, activeSpecialty, setActiveSpecialty, setSelectedArticle, allExpanded, setAllExpanded, searchQuery, setSearchQuery, setActiveTab, setSelectedDoctor, setSelectedSpecialty }: any) {
  const { t, language } = useLanguage();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const activeSpecData = useMemo(() => {
    return SPECIALTIES.find(s => s.name_en === activeSpecialty || s.name_ku === activeSpecialty);
  }, [activeSpecialty]);

  const filteredArticles = useMemo(() => {
    let filtered = articles;
    if (activeSpecialty) {
      if (activeSpecialty === 'Latest') {
         return [...articles].sort((a: Article, b: Article) => b.publishedAt.localeCompare(a.publishedAt));
      }
      filtered = filtered.filter((a: Article) => a.category_en === activeSpecialty || a.category_ku === activeSpecialty);
    }
    if (searchQuery) {
      filtered = filtered.filter((a: Article) => 
        a.title_en.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.title_ku.includes(searchQuery) ||
        a.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [activeSpecialty, searchQuery, articles]);

  const articlesByCategory = useMemo(() => {
    const groups: Record<string, typeof articles> = {};
    filteredArticles.forEach(art => {
      const cat = language === 'en' ? art.category_en : art.category_ku;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(art);
    });
    
    // Sort according to SPECIALTIES order
    const sortedGroups: Record<string, typeof articles> = {};
    SPECIALTIES.forEach(spec => {
      const name = language === 'en' ? spec.name_en : spec.name_ku;
      if (groups[name]) {
        sortedGroups[name] = groups[name];
      }
    });
    
    // Add any categories not in the specialties list
    Object.keys(groups).forEach(name => {
      if (!sortedGroups[name]) sortedGroups[name] = groups[name];
    });
    
    return sortedGroups;
  }, [filteredArticles, language]);

  return (
    <div className="p-4 md:p-6 space-y-8 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Search Header */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-900/50">
           <div>
              <p className="text-[10px] font-black uppercase text-teal-600 tracking-widest">Searching for</p>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">"{searchQuery}"</h2>
           </div>
           <button onClick={() => setSearchQuery('')} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X size={18}/></button>
        </div>
      )}

      {!searchQuery && (
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
            {activeSpecialty === 'Latest' ? t('latestArticles') : (activeSpecialty || t('magazineTitle'))}
          </h2>
        </div>
      )}

      {/* Magazine Cover removed as requested */}
      {!activeSpecialty && !searchQuery && (
        <div className="space-y-8">
          <div className="py-8 border-b border-slate-100 dark:border-slate-800">
             <h3 className="text-5xl font-black text-slate-900 dark:text-white font-arabic tracking-tighter leading-none">{t('magazineTitle')}</h3>
             <p className="text-slate-500 mt-4 text-lg font-medium max-w-2xl">Your daily dose of wellness and medical insights, expert medical opinions, and health tips.</p>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase text-teal-600 tracking-widest px-1">{t('latestArticles')}</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...MOCK_ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3).map(art => (
                  <div 
                    key={art.id} onClick={() => setSelectedArticle(art)}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-teal-200 transition-all group"
                  >
                     <p className="text-[9px] font-black text-teal-600 uppercase mb-1">{language === 'en' ? art.category_en : art.category_ku}</p>
                     <h5 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-teal-600 transition-colors">{language === 'en' ? art.title_en : art.title_ku}</h5>
                     <p className="text-[10px] text-slate-400 mt-2">{art.publishedAt}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex justify-center pt-2">
             <button 
               onClick={() => setAllExpanded(!allExpanded)}
               className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase text-slate-500 hover:text-teal-600 transition-all shadow-sm"
             >
               {allExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
               {allExpanded ? 'Collapse Topics' : 'Explore All Topics'}
             </button>
          </div>
        </div>
      )}

      {/* Specialty Header Page */}
      {activeSpecialty && activeSpecialty !== 'Latest' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-slate-900 dark:bg-slate-900 rounded-2xl text-white space-y-4 shadow-xl border border-white/5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black font-arabic text-teal-600">{activeSpecialty}</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setActiveTab('directory');
                  setSelectedSpecialty(activeSpecialty);
                }}
                className="flex items-center gap-2 text-[10px] font-black uppercase bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all"
              >
                {t('goToDirectory')} <ArrowRight size={14} />
              </button>
              <button onClick={() => setActiveSpecialty(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X size={16}/></button>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-2xl">
             {activeSpecData ? (language === 'en' ? activeSpecData.description_en : activeSpecData.description_ku) : `Comprehensive guide and latest news covering ${activeSpecialty} breakthroughs.`}
          </p>
          <div className="flex gap-4 pt-2">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest">Articles</span>
               <span className="text-xl font-black">{filteredArticles.length}</span>
            </div>
            <div className="w-px bg-white/10 my-1" />
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest">Readers</span>
               <span className="text-xl font-black">1.2K</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-8">
        {Object.entries(articlesByCategory).map(([cat, arts]) => (
          <div key={cat} className="space-y-4">
             {(!activeSpecialty || activeSpecialty === 'Latest') && (
                <button 
                  onClick={() => setOpenCategory(openCategory === cat ? null : cat)}
                  className="w-full flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors"
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{cat}</span>
                  {(openCategory === cat || allExpanded) ? <ChevronUp size={14} className="text-slate-300" /> : <ChevronDown size={14} className="text-slate-300" />}
                </button>
             )}
             
             <AnimatePresence>
               {(openCategory === cat || activeSpecialty || allExpanded) && (
                 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-6 pt-2">
                    {(arts as any[]).map(art => (
                      <div key={art.id} onClick={() => setSelectedArticle(art)} className="group cursor-pointer">
                         <div className="flex flex-col md:flex-row gap-6">
                           <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">{language === 'en' ? art.category_en : art.category_ku}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">5 min read</span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors leading-tight">
                                {language === 'en' ? art.title_en : art.title_ku}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {language === 'en' ? art.content_en.substring(0, 100) : art.content_ku.substring(0, 100)}...
                              </p>
                              <div className="flex items-center gap-2 pt-2">
                                <div className="w-5 h-5 bg-slate-900 dark:bg-slate-800 rounded-full text-[8px] flex items-center justify-center text-white font-black">{art.author[0]}</div>
                                <span className="text-[10px] font-bold text-slate-900 dark:text-slate-300 uppercase tracking-tight">{art.author}</span>
                              </div>
                           </div>
                         </div>
                      </div>
                    ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        ))}
        {filteredArticles.length === 0 && (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center mx-auto">
                <BookOpen className="text-slate-300" size={24} />
             </div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No articles found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CMSSection({ setDoctors, setArticles, isImporting, setIsImporting, importProgress, setImportProgress }: { 
  setDoctors: React.Dispatch<React.SetStateAction<Doctor[]>>, 
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>,
  isImporting: boolean,
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>,
  importProgress: number,
  setImportProgress: React.Dispatch<React.SetStateAction<number>>
}) {
  const [activeForm, setActiveForm] = useState<'doctor' | 'article' | 'import'>('import');
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple password for demo
      setIsAuthorized(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center space-y-6">
           <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto">
              <Lock className="text-teal-600" size={28} />
           </div>
           <div className="space-y-2">
             <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Admin Access</h2>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Please enter your credentials</p>
           </div>
           <input 
             type="password" 
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             placeholder="Enter Password" 
             className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-1 focus:ring-teal-500 dark:text-white"
           />
           <button type="submit" className="w-full btn-dark py-4 text-xs bg-slate-900 dark:bg-white dark:text-slate-900">Unlock Panel</button>
        </form>
      </div>
    );
  }

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImporting(true);
      setImportProgress(0);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const importedData = results.data as any[];
          let successCount = 0;
          const total = importedData.length;
          
          for (let i = 0; i < total; i++) {
            const row = importedData[i];
            
            // Map Kurdish and English based on common logic if no separate provided
            const ku_name = row.name || row.Name || row.name_ku || '';
            const ku_spec = row.specialty || row.Specialty || row.specialty_ku || 'گشتی';
            const ku_city = row.city || row.City || row.location_ku || 'هەولێر';
            
            // Normalize city names for English filters
            const cityMap: Record<string, string> = {
              'ڕانیە': 'Rania',
              'هەڵەبجە': 'Halabja',
              'سلێمانی': 'Sulaymaniyah',
              'هەولێر': 'Erbil',
              'دهۆک': 'Duhok',
              'کەرکوک': 'Kirkuk'
            };
            const en_city = row.city_en || cityMap[ku_city] || ku_city;

            // Normalize specialties for consistency if possible
            const specMap: Record<string, string> = {
              'نەشتەرگەری چاو': 'Ophthalmology',
              'پێست': 'Dermatology',
              'نەشتەرگەری گشتی': 'General Surgery',
              'دەم و ددان': 'Dentistry',
              'هەناوی': 'Internal Medicine',
              'ژنان و مناڵبوون': 'Gynecology',
              'ئێسک و شکاوی': 'Orthopedics',
              'قوڕگ و لوت و گوێ': 'ENT',
              'مناڵان و تازە لەدایکبووان': 'Pediatrics',
              'مێشک و دەمار': 'Neurology',
              'میزەڕۆ و گورچیلە': 'Urology',
              'دڵ و قەستەرە': 'Cardiology',
              'بێهۆشکاری': 'Anesthesia'
            };
            const en_spec = row.specialty_en || specMap[ku_spec] || ku_spec;
            
            const newDoc: Omit<Doctor, 'id'> = {
              name_ku: ku_name,
              name_en: row.name_en || ku_name, 
              specialty_ku: ku_spec,
              specialty_en: en_spec,
              certification_ku: row.qualifications || row.qualifications_ku || '',
              certification_en: row.qualifications_en || row.qualifications || '',
              clinic_ku: row.clinic || '',
              clinic_en: row.clinic_en || row.clinic || '',
              workdays_ku: row.days || row.workdays_ku || '',
              workdays_en: row.days_en || row.days || '',
              fee: row.fee || '',
              phoneNumber: row.phone || row.phone_number || '',
              address_ku: row.address || '',
              address_en: row.address_en || row.address || '',
              sourceLink: row.source || row.link || '',
              experience: parseInt(row.experience) || 0,
              location_ku: ku_city,
              location_en: en_city,
              contact: row.phone || '',
              bio_en: row.bio_en || '',
              bio_ku: row.notes || row.bio_ku || '',
              availableToday: true
            };
            
            if (!newDoc.name_ku) continue; // Skip empty rows
            
            try {
              await dataService.addDoctor(newDoc);
              successCount++;
              setImportProgress(Math.round(((i + 1) / total) * 100));
            } catch (err) {
              console.error("Failed to upload doctor:", err);
            }
          }

          const updatedDocs = await dataService.getDoctors();
          setDoctors(updatedDocs);
          setIsImporting(false);
          alert(`Successfully imported ${successCount} doctors to cloud database.`);
        }
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Editor Portal</h2>
        <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg p-0.5">
          <button onClick={() => setActiveForm('import')} className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${activeForm === 'import' ? 'bg-white dark:bg-slate-800 shadow-sm text-teal-600' : 'text-slate-400'}`}>Import</button>
          <button onClick={() => setActiveForm('article')} className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${activeForm === 'article' ? 'bg-white dark:bg-slate-800 shadow-sm text-teal-600' : 'text-slate-400'}`}>Content</button>
          <button onClick={() => setActiveForm('doctor')} className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${activeForm === 'doctor' ? 'bg-white dark:bg-slate-800 shadow-sm text-teal-600' : 'text-slate-400'}`}>Listing</button>
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 transition-colors">
        {activeForm === 'import' ? (
          <div className="space-y-6 text-center py-8">
            <div className="max-w-md mx-auto space-y-4">
               {isImporting ? (
                 <div className="p-12 space-y-4">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                       <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${importProgress}%` }} />
                    </div>
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{importProgress}% Uploaded...</p>
                 </div>
               ) : (
                 <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center gap-3">
                    <Plus className="text-slate-300 dark:text-slate-600" size={32} />
                    <div>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Drop doctor list CSV here</p>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter">Fields: id, name, specialty, qualifications, clinic, address, days, phone, fee, city</p>
                    </div>
                    <input type="file" accept=".csv" onChange={handleCsvImport} className="hidden" id="csv-upload" />
                    <label htmlFor="csv-upload" className="btn-dark py-2 px-6 text-[10px] cursor-pointer mt-2 bg-slate-900 dark:bg-white dark:text-slate-900">Browse Files</label>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 w-full mt-4">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">Or use the data you provided me:</p>
                      <button 
                        type="button"
                        onClick={async () => {
                          setIsImporting(true);
                          setImportProgress(0);
                          let count = 0;
                          for (let i = 0; i < DOCTORS_SEED.length; i++) {
                            try {
                              await dataService.addDoctor(DOCTORS_SEED[i]);
                              count++;
                              setImportProgress(Math.round(((i + 1) / DOCTORS_SEED.length) * 100));
                            } catch (e) { 
                              console.error("Sync error:", e);
                            }
                          }
                          const updated = await dataService.getDoctors();
                          setDoctors(updated);
                          setIsImporting(false);
                          alert(`Success! Restored ${count} doctors from your file.`);
                        }}
                        className="text-[10px] font-black text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest"
                      >
                        Sync Provided CSV Data
                      </button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        ) : (
          <form className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Name (En)</label>
               <input type="text" className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-bold dark:text-white" />
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Specialty</label>
               <input type="text" className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-bold dark:text-white" />
             </div>
             <div className="col-span-2 space-y-1">
               <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Biography</label>
               <textarea rows={3} className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-medium resize-none dark:text-white" />
             </div>
             <div className="col-span-2 flex justify-end pt-2">
                <button type="submit" className="btn-dark py-2.5 px-10 text-[10px] bg-slate-900 dark:bg-white dark:text-slate-900">Save Record</button>
             </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
