/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useId, MouseEvent } from "react";
import {
  Search,
  Bell,
  Menu,
  TrendingUp,
  Globe,
  ArrowRight,
  Moon,
  Sun,
  Twitter,
  Facebook,
  Share2,
  Bookmark,
  Clock,
  Loader2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NewsItem } from "./types";
import { translations, Language } from "./translations";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800&h=450";

const CATEGORY_FALLBACKS: Record<string, string> = {
  Gündem:
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800&h=450",
  Ekonomi:
    "https://images.unsplash.com/photo-1611974717482-4828c4033ccf?auto=format&fit=crop&q=80&w=800&h=450",
  Teknoloji:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800&h=450",
  Spor: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800&h=450",
  Yaşam:
    "https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&q=80&w=800&h=450",
  Bilim:
    "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800&h=450",
  Dünya:
    "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800&h=450",
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lang");
      return (saved as Language) || "TR";
    }
    return "TR";
  });

  const uid = useId().replace(/:/g, '');
  const t = translations[lang];

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    translations.TR.categories.forEach((tr, i) => {
      map[tr] = translations[lang].categories[i];
      map[translations.EN.categories[i]] = translations[lang].categories[i];
    });
    return map;
  }, [lang]);

  const [activeTab, setActiveTab] = useState(() => t.categories[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("isDarkMode");
      if (saved !== null) return JSON.parse(saved);

      // Default to true (dark) as requested, or follow system if it's dark
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return systemDark || true;
    }
    return true;
  });

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<number | null>(null);
  const [savedNews, setSavedNews] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("savedNews");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({
    Teknoloji: 10,
    Ekonomi: 10,
    Spor: 10,
    Bilim: 10,
    Dünya: 10,
    Yaşam: 10,
  });
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(
    new Set(),
  );
  const [lastUpdateId, setLastUpdateId] = useState<number | null>(null);
  const [detailScrollProgress, setDetailScrollProgress] = useState(0);

  // Initial fetch + refresh every 2 minutes
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setNewsList(data.news);
        setFetchError(null);
      } catch (err: any) {
        setFetchError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleDetailScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const denom = el.scrollHeight - el.clientHeight;
    if (denom <= 0) return;
    setDetailScrollProgress((el.scrollTop / denom) * 100);
  };

  const handleNewsClick = (id: number) => {
    const news = newsList.find(n => n.id === id);
    if (!news) {
      console.warn("News not found, resetting selection.");
      setSelectedNewsId(null);
      return;
    }
    
    // We show the detail view where users can see AI analysis and then jump to source
    setSelectedNewsId(id);
    setDetailScrollProgress(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openSource = (url: string) => {
    if (!url) return;
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open URL:", error);
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    }
  };

  const handleImageError = (id: number) => {
    setNewsList((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const fallback =
            CATEGORY_FALLBACKS[n.category] ||
            CATEGORY_FALLBACKS[getTRCategory(n.category)] ||
            FALLBACK_IMAGE;

          if (n.image === fallback) return n;

          return {
            ...n,
            hasImageError: true,
            image: fallback,
          };
        }
        return n;
      }),
    );
  };

  // Real-time update simulator
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setNewsList((prev) => {
        // Select a random category to ensure all categories get updates
        const categories = t.categories;
        const randomCat =
          categories[Math.floor(Math.random() * categories.length)];

        // Find a base item from same category if possible, else any
        const catItems = prev.filter(
          (n) =>
            n.category === randomCat ||
            (lang === "EN" &&
              translations.TR.categories[categories.indexOf(randomCat)] ===
                n.category),
        );
        const baseItem =
          catItems.length > 0
            ? catItems[Math.floor(Math.random() * catItems.length)]
            : prev[Math.floor(Math.random() * prev.length)];

        const newId = prev.reduce((max, n) => n.id > max ? n.id : max, 0) + 1;
        const isBreaking = Math.random() > 0.4;

        const itemToAdd: NewsItem = {
          ...baseItem,
          id: newId,
          category: getTRCategory(baseItem.category),
          isNew: true,
          date: lang === "TR" ? "AZ ÖNCE" : "JUST NOW",
          isAiSummarized: false,
          image: `https://picsum.photos/seed/${newId}/800/450`,
        };

        // Prepend to list
        const newList = [itemToAdd, ...prev.slice(0, 150)]; 

        setLastUpdateId(newId);

        // If it's breaking news and we are on the landing page, show the flash!
        if (isBreaking && activeTab === categories[0]) {
          setActiveHeroIdx(0);
          const heroEl = document.getElementById("scroll-hero");
          if (heroEl) {
            heroEl.scrollTo({ left: 0, behavior: "smooth" });
          }
        }

        // Clear "isNew" flag
        setTimeout(() => {
          setNewsList((current) =>
            current.map((n) => (n.id === newId ? { ...n, isNew: false } : n)),
          );
        }, 15000);

        return newList;
      });
    }, 25000); // Updated every 25 seconds for a "lively" feel

    return () => clearInterval(updateInterval);
  }, [lang, activeTab]);

  // Utility for horizontal scrolling
  const scrollContainer = (id: string, direction: "left" | "right") => {
    const el = document.getElementById(`scroll-${id}`);
    if (el) {
      const scrollAmount =
        direction === "left" ? -el.offsetWidth : el.offsetWidth;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Filter content based on active tab and search query
  const filteredNews = (
    activeTab === t.categories[0]
      ? newsList
      : activeTab === t.savedNews
        ? newsList.filter((n) => savedNews.includes(n.id))
        : newsList.filter(
            (n) =>
              getTRCategory(n.category) === getTRCategory(activeTab),
          )
  ).filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Featured News Slider (Top 10)
  const heroItems = newsList.slice(0, 10);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  const toggleBookmark = (e: MouseEvent, id: number) => {
    e.stopPropagation();
    setSavedNews((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleLoadMore = (category: string) => {
    setLoadingCategories((prev) => new Set(prev).add(category));

    // Simulate API fetch delay
    setTimeout(() => {
      setCategoryLimits((prev) => ({
        ...prev,
        [category]: (prev[category] || 10) + 5,
      }));
      setLoadingCategories((prev) => {
        const next = new Set(prev);
        next.delete(category);
        return next;
      });
    }, 800);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("savedNews", JSON.stringify(savedNews));
  }, [savedNews]);

  const toggleLang = () => {
    const nextLang = lang === "TR" ? "EN" : "TR";
    const currentIndex = translations[lang].categories.indexOf(activeTab);
    const wasSaved = activeTab === translations[lang].savedNews;

    setLang(nextLang);
    if (wasSaved) {
      setActiveTab(translations[nextLang].savedNews);
    } else if (currentIndex !== -1) {
      setActiveTab(translations[nextLang].categories[currentIndex]);
    } else {
      setActiveTab(translations[nextLang].categories[0]);
    }
  };

  const getCategoryValue = (tab: string) => categoryMap[tab] ?? tab;

  const getTRCategory = (tab: string) => {
    const trIndex = translations.TR.categories.indexOf(tab);
    const enIndex = translations.EN.categories.indexOf(tab);
    const index = trIndex !== -1 ? trIndex : enIndex;
    if (index !== -1) return translations.TR.categories[index];
    return tab;
  };

  return (
    <div className="min-h-screen bg-[#f4f1eb] dark:bg-slate-950 font-sans text-[#0F172A] dark:text-slate-100 selection:bg-red-100 selection:text-red-600 transition-colors duration-300">
      {isLoading && (
        <div className="fixed inset-0 z-[200] bg-[#f4f1eb] dark:bg-slate-950 flex flex-col items-center justify-center gap-6">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Haberler Yükleniyor...</p>
        </div>
      )}
      {fetchError && !isLoading && newsList.length === 0 && (
        <div className="fixed inset-0 z-[200] bg-[#f4f1eb] dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
          <p className="text-red-600 font-black uppercase text-sm">Haberler yüklenemedi</p>
          <p className="text-slate-400 text-xs">{fetchError}</p>
        </div>
      )}
      {/* NAVBAR */}
      <nav className="bg-[#f4f1eb] dark:bg-slate-950 border-b border-[#E2E8F0] dark:border-slate-800 sticky top-0 z-50 h-[65px] flex items-center shadow-sm/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div
              className="flex items-center cursor-pointer group -ml-2"
              onClick={() => setActiveTab(t.categories[0])}
            >
              <svg
                width="65"
                height="60"
                viewBox="0 0 160 150"
                style={{ overflow: "visible" }}
              >
                <defs>
                  <linearGradient
                    id={`${uid}-copper`}
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#9a300e" />
                    <stop offset="50%" stopColor="#cd5521" />
                    <stop offset="100%" stopColor="#e37b42" />
                  </linearGradient>
                  <linearGradient
                    id={`${uid}-glass`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fad0ae" />
                    <stop offset="40%" stopColor="#ea5b11" />
                    <stop offset="100%" stopColor="#7a1400" />
                  </linearGradient>
                  <filter
                    id={`${uid}-shadow`}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="3"
                      dy="5"
                      stdDeviation="4"
                      floodColor="#000"
                      floodOpacity="0.25"
                    />
                  </filter>
                </defs>
                <circle cx="20" cy="115" r="7.5" fill={`url(#${uid}-copper)`} />
                <path
                  d="M 6 92 A 25 25 0 0 1 43 130"
                  fill="none"
                  stroke={`url(#${uid}-copper)`}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M -8 70 A 45 45 0 0 1 65 135"
                  fill="none"
                  stroke={`url(#${uid}-copper)`}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M 8 65 Q 150 -50 420 50"
                  fill="none"
                  stroke={`url(#${uid}-copper)`}
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />
                <polygon
                  points="75,70 105,90 75,110"
                  fill={`url(#${uid}-glass)`}
                  filter={`url(#${uid}-shadow)`}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1.5"
                />
              </svg>
              <div
                className="font-display font-bold text-[#1a273b] dark:text-slate-100 uppercase tracking-tight relative top-[6px] -ml-10 flex items-center gap-2"
                style={{
                  fontSize: "2rem",
                  textShadow: isDarkMode
                    ? "none"
                    : "0.5px 0.5px 1px rgba(255, 255, 255, 0.8), -0.5px -0.5px 1px rgba(0, 0, 0, 0.2)",
                }}
              >
                <span className="font-extrabold text-2xl tracking-tighter uppercase italic">
  SON<span className="text-orange-600">ARAT</span>
</span>
                <span className="flex h-3 w-3 relative mb-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
              </div>
            </div>
            <div className="hidden lg:flex gap-6 font-bold text-[11px] uppercase tracking-widest">
              {t.categories.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? "text-red-600"
                      : "text-[#64748B] dark:text-slate-400 hover:text-red-500"
                  } transition-all relative group h-[65px] flex items-center`}
                >
                  {tab === t.savedNews ? (
                    <span className="flex items-center gap-1.5">
                      <Bookmark
                        size={12}
                        fill={
                          activeTab === tab || savedNews.length > 0
                            ? "currentColor"
                            : "none"
                        }
                        className={savedNews.length > 0 ? "text-red-600" : ""}
                      />
                      {tab}
                      {savedNews.length > 0 && (
                        <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                          {savedNews.length}
                        </span>
                      )}
                    </span>
                  ) : (
                    tab
                  )}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-red-600"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 text-[#94A3B8] dark:text-slate-500">
            <div className="flex items-center gap-4 md:gap-6 border-r border-[#E2E8F0] dark:border-slate-800 pr-4 md:pr-6">
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-full p-0.5 border border-slate-200 dark:border-slate-800 mr-2">
                <button
                  onClick={toggleLang}
                  className="p-1 px-2.5 rounded-full text-[9px] font-black uppercase transition-all flex items-center gap-1.5 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <Globe size={10} className="text-red-600" />
                  {lang === "TR" ? "ENGLISH" : "TÜRKÇE"}
                </button>
              </div>

              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border-none text-[11px] font-bold py-1.5 px-3 rounded-full w-full focus:ring-1 focus:ring-red-600 outline-none uppercase tracking-widest"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <Search
                className="cursor-pointer hover:text-red-600 transition-colors"
                size={18}
                onClick={() => setShowSearch(!showSearch)}
              />
              <Bell
                className="cursor-pointer hover:text-red-600 transition-colors"
                size={18}
              />
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-slate-400 hover:text-red-600"
              title={isDarkMode ? "Aydınlık Temaya Geç" : "Karanlık Temaya Geç"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="md:hidden text-[#0F172A] dark:text-slate-100 p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-[65px] left-0 right-0 border-t border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xl z-50"
            >
              <div className="flex flex-col p-6 gap-4 font-bold text-[11px] uppercase tracking-widest">
                {[...t.categories, t.savedNews].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setIsMenuOpen(false);
                    }}
                    className={`${
                      activeTab === tab
                        ? "text-red-600"
                        : "text-[#64748B] dark:text-slate-400"
                    } py-2 text-left flex items-center justify-between`}
                  >
                    <span className="flex items-center gap-2">
                      {tab === t.savedNews && (
                        <Bookmark
                          size={14}
                          fill={savedNews.length > 0 ? "currentColor" : "none"}
                        />
                      )}
                      {tab}
                    </span>
                    {tab === t.savedNews && savedNews.length > 0 && (
                      <span className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                        {savedNews.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* SON DAKİKA BANDI (TICKER) */}
      <div className="bg-[#0F172A] dark:bg-slate-950 border-b border-black py-2 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full flex items-center gap-4">
          <div className="flex gap-16 animate-marquee whitespace-nowrap text-[12px] font-bold text-white/90 uppercase tracking-tight">
            {newsList.slice(0, 5).map((news) => (
              <div
                key={`ticker-${news.id}`}
                className="flex items-center gap-4 pointer-events-auto cursor-pointer hover:text-red-400 transition-colors"
                onClick={() => handleNewsClick(news.id)}
              >
                <span className="text-red-500 font-black">/</span>
                <p>{news.title}</p>
              </div>
            ))}
            {/* Duplicated for smooth loop */}
            {newsList.slice(0, 5).map((news) => (
              <div
                key={`ticker-dup-${news.id}`}
                className="flex items-center gap-4 pointer-events-auto cursor-pointer hover:text-red-400 transition-colors"
                onClick={() => handleNewsClick(news.id)}
              >
                <span className="text-red-500 font-black">/</span>
                <p>{news.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEWS DETAIL OVERLAY */}
      <AnimatePresence>
        {selectedNewsId && (
          <motion.div
            key={`detail-${selectedNewsId}`}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            onScroll={handleDetailScroll}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-[#f4f1eb] dark:bg-slate-950 overflow-y-auto"
          >
            {(() => {
              const news = newsList.find((n) => n.id === selectedNewsId);
              if (!news) return null;
              const readingTime = Math.ceil(news.summary.split(" ").length / 30) + 2;
              return (
                <div className="min-h-screen flex flex-col">
                  {/* DETAIL HEADER */}
                  <div className="sticky top-0 z-50 bg-[#f4f1eb]/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 h-[65px] flex items-center justify-between">
                    <div className="absolute bottom-0 left-0 h-[2px] bg-red-600 transition-all duration-100" style={{ width: `${detailScrollProgress}%` }} />
                    <button
                      onClick={() => setSelectedNewsId(null)}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-600 font-bold uppercase text-[11px] tracking-widest transition-colors"
                    >
                      <ChevronLeft size={18} /> {t.backToGündem}
                    </button>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => toggleBookmark(e, news.id)}
                        className={`p-2 rounded-full transition-all ${
                          savedNews.includes(news.id)
                            ? "bg-red-600 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-500 hover:text-white"
                        }`}
                      >
                        <Bookmark
                          size={16}
                          fill={
                            savedNews.includes(news.id) ? "currentColor" : "none"
                          }
                        />
                      </button>
                      <button
                        onClick={() => openSource(news.url)}
                        className="bg-red-600 text-white px-5 py-2 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg shadow-red-600/20"
                      >
                        {t.readNews}
                      </button>
                    </div>
                  </div>

                  <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-10 md:py-16">
                    <div className="flex flex-col gap-8">
                      {/* DATE & SOURCE */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="bg-red-600 text-white text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-[0.2em]">
                            {getCategoryValue(news.category)}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            {news.date}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> {readingTime} {lang === "TR" ? "DAKİKA OKUMA" : "MIN READ"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest">
                          <Globe size={12} className="text-red-600" />
                          {news.source}
                        </div>
                      </div>

                      {/* TITLE */}
                      <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tighter dark:text-white uppercase">
                        {news.title}
                      </h1>

                      {/* IMAGE */}
                      <div className="relative aspect-video rounded-[32px] overflow-hidden shadow-2xl group">
                        <img
                          src={news.image || FALLBACK_IMAGE}
                          alt={news.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={() => handleImageError(news.id)}
                        />
                      </div>

                      {/* CONTENT GRID */}
                      <div className="grid grid-cols-1 gap-12 mt-4">
                        <div className="space-y-6">
                          <p className="text-xl md:text-2xl font-serif text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-4 border-red-600 pl-6 py-2">
                            {news.summary}
                          </p>
                          <div className="prose dark:prose-invert prose-slate max-w-none">
                            <div className="mt-2 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 text-center">
                              <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {lang === "TR" ? "Haberin tamamını okumak için kaynağa gidin." : "Visit the source to read the full story."}
                              </p>
                              <button
                                onClick={() => openSource(news.url)}
                                className="bg-red-600 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
                              >
                                <ArrowRight size={14} /> {t.sourceLink}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SHARE BUTTONS */}
                      <div className="flex items-center justify-center gap-4 py-12 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-2">{t.shareNews}</span>
                        <button className="p-3 rounded-full bg-blue-600 text-white hover:scale-110 transition-transform"><Facebook size={18} /></button>
                        <button className="p-3 rounded-full bg-sky-500 text-white hover:scale-110 transition-transform"><Twitter size={18} /></button>
                        <button className="p-3 rounded-full bg-slate-800 text-white hover:scale-110 transition-transform"><Share2 size={18} /></button>
                      </div>

                      {/* RELATED NEWS */}
                      <div className="mt-12 pb-24">
                        <div className="flex items-center gap-4 mb-8">
                          <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">{lang === "TR" ? "İLGİLİ HABERLER" : "RELATED STORIES"}</h3>
                          <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {newsList
                            .filter(n => n.category === news.category && n.id !== news.id)
                            .slice(0, 3)
                            .map(related => (
                              <div 
                                key={`related-${related.id}`}
                                onClick={() => handleNewsClick(related.id)}
                                className="group cursor-pointer"
                              >
                                <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 relative">
                                  <img 
                                    src={related.image || FALLBACK_IMAGE} 
                                    alt={related.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                </div>
                                <h4 className="font-bold text-sm leading-snug group-hover:text-red-600 transition-colors dark:text-white uppercase">
                                  {related.title}
                                </h4>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* HERO SECTION - 2/3 Hero + 1/3 Latest News */}
        {activeTab === t.categories[0] ? (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8 md:mb-12">
            {/* Main Slider (2/3) */}
            <section className="relative group/hero">
              <div
                id="scroll-hero"
                className="flex overflow-x-auto snap-x snap-mandatory gap-0 no-scrollbar rounded-[24px] bg-black shadow-xl h-[350px] lg:h-[400px]"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const idx = Math.round(el.scrollLeft / el.offsetWidth);
                  setActiveHeroIdx(idx);
                }}
              >
                {heroItems.map((item, idx) => (
                  <motion.div
                    key={`hero-${item.id}`}
                    className="min-w-full snap-start relative overflow-hidden cursor-pointer h-full"
                    onClick={() => handleNewsClick(item.id)}
                  >
                    <img
                      src={item.image || FALLBACK_IMAGE}
                      className="h-full w-full object-cover opacity-60 hover:opacity-75 transition-opacity duration-700"
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError(item.id)}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10 pointer-events-none">
                      <div className="flex flex-wrap items-center gap-2 mb-3 pointer-events-auto">
                        <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                          {getCategoryValue(item.category)}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">
                          {item.source}
                        </span>
                      </div>
                      <h2 className="text-white text-xl md:text-3xl font-black mb-3 leading-tight tracking-tighter max-w-2xl uppercase pointer-events-auto">
                        {item.title}
                      </h2>
                      <div className="flex items-center gap-4 pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNewsClick(item.id);
                          }}
                          className="bg-white text-black px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-red-600 hover:text-white transition-all"
                        >
                          {t.readNews}
                        </button>
                        <button
                          onClick={(e) => toggleBookmark(e, item.id)}
                          className={`p-2 rounded-full border border-white/20 backdrop-blur-md transition-all ${
                            savedNews.includes(item.id)
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                        >
                          <Bookmark
                            size={14}
                            fill={
                              savedNews.includes(item.id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Hero Navigation Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {heroItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const el = document.getElementById("scroll-hero");
                      el?.scrollTo({
                        left: idx * el.offsetWidth,
                        behavior: "smooth",
                      });
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${activeHeroIdx === idx ? "bg-white w-4" : "bg-white/40"}`}
                  />
                ))}
              </div>

              {/* Hero Arrows */}
              <button
                onClick={() => scrollContainer("hero", "left")}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-red-600 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover/hero:opacity-100 transition-all z-20"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollContainer("hero", "right")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-red-600 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 opacity-0 group-hover/hero:opacity-100 transition-all z-20"
              >
                <ChevronRight size={20} />
              </button>
            </section>

            {/* Sidebar: Son Gelişmeler (1/3) */}
            <aside className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-5 flex flex-col h-[350px] lg:h-[400px] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                  <TrendingUp size={14} /> {t.lastDevelopments}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
                {newsList.slice(10, 20).map((news, idx) => (
                  <motion.div
                    key={`latest-${news.id}`}
                    layout
                    whileHover={{ x: 3 }}
                    onClick={() => handleNewsClick(news.id)}
                    className="group cursor-pointer flex gap-3 items-start border-b border-slate-50 dark:border-slate-800/50 pb-3 last:border-0 relative"
                  >
                    <span className="text-slate-300 dark:text-slate-700 font-black text-xs shrink-0 mt-1">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-[12px] font-bold leading-tight line-clamp-2 group-hover:text-red-600 transition-colors dark:text-slate-200 uppercase">
                          {news.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[8px] text-slate-400 font-bold uppercase">
                          {news.source}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-[8px] text-red-600 font-black uppercase">
                          {news.date}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab(t.categories[1])}
                className="mt-4 w-full bg-slate-50 dark:bg-slate-800/50 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors shrink-0"
              >
                {t.seeMore} →
              </button>
            </aside>
          </div>
        ) : filteredNews.length > 0 ? (
          /* Small Hero for Categories */
          <section
            onClick={() => handleNewsClick(filteredNews[0].id)}
            className="mb-8 overflow-hidden rounded-[24px] bg-black h-[300px] relative cursor-pointer group"
          >
            <img
              src={filteredNews[0].image || FALLBACK_IMAGE}
              className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700"
              referrerPolicy="no-referrer"
              alt={filteredNews[0].title}
              onError={() => handleImageError(filteredNews[0].id)}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black to-transparent pointer-events-none">
              <span className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em] mb-2">
                {activeTab} {t.heroSpecial}
              </span>
              <h2 className="text-white text-3xl font-black tracking-tighter uppercase leading-tight max-w-2xl">
                {filteredNews[0].title}
              </h2>
              <div className="flex items-center gap-3 mt-4">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded border border-white/10 uppercase tracking-widest">
                  {filteredNews[0].source}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewsClick(filteredNews[0].id);
                  }}
                  className="bg-red-600 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-white hover:text-black transition-all"
                >
                  {t.readNews}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-12 bg-white dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-colors"
          >
            <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-full mb-6">
              <Bookmark size={48} className="text-red-500 opacity-20" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">
              {t.noSavedNews}
            </h3>
            <p className="text-slate-500 max-w-xs text-sm mb-6">
              {t.saveNewsHelp}
            </p>
            <button
              onClick={() => setActiveTab(t.categories[0])}
              className="bg-red-600 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-xl shadow-red-500/20"
            >
              {t.backToGündem} →
            </button>
          </motion.div>
        )}

        {/* HABER AKIŞI (Bundle Tarzı Yatay Kaydırma) */}
        <section className="space-y-12">
          {activeTab === "Gündem" ? (
            <>
              {/* Öne Çıkanlar Yatay Şerit */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                    {t.featured}
                  </h3>
                </div>
                <div className="relative group/carousel">
                  <div
                    id="scroll-Öne Çıkanlar"
                    className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
                  >
                    {newsList.slice(0, 5).map((news) => (
                      <motion.div
                        key={`featured-${news.id}`}
                        whileHover={{ y: -4 }}
                        className="min-w-[220px] md:min-w-[260px] snap-start bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm transition-all cursor-pointer flex flex-col group relative"
                      >
                        <div
                          onClick={() => handleNewsClick(news.id)}
                          className="flex flex-col h-full"
                        >
                          <div className="relative h-28 overflow-hidden">
                            <img
                              src={news.image || FALLBACK_IMAGE}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              alt={news.title}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={() => handleImageError(news.id)}
                            />
                            <div className="absolute top-2 left-2 bg-red-600 text-[7px] text-white font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                              {getCategoryValue(news.category)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(e, news.id);
                              }}
                              className={`absolute top-2 right-2 p-1 backdrop-blur-md rounded-full transition-all shadow-sm z-10 ${
                                savedNews.includes(news.id)
                                  ? "bg-red-600 text-white"
                                  : "bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-red-600"
                              }`}
                            >
                              <Bookmark
                                size={10}
                                fill={
                                  savedNews.includes(news.id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[7px] text-red-600 font-black uppercase tracking-widest">
                                  {news.source}
                                </span>
                                <span className="text-[7px] text-slate-400 font-bold uppercase">
                                  {news.date}
                                </span>
                              </div>
                              <h4 className="font-bold text-[11px] leading-snug line-clamp-2 dark:text-slate-100 group-hover:text-red-600 transition-colors uppercase">
                                {news.title}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {/* Navigation Arrows */}
                  <button
                    onClick={() => scrollContainer("Öne Çıkanlar", "left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all z-10 -ml-5"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => scrollContainer("Öne Çıkanlar", "right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover/carousel:opacity-100 transition-all z-10 -mr-5"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Kategorilere Göre Gruplanmış Yatay Şeritler */}
              {t.categories.slice(1).map((cat) => {
                const catAllNews = newsList.filter(
                  (n) =>
                    n.category === cat || getCategoryValue(n.category) === cat,
                );
                const limit = categoryLimits[cat] || 6;
                const catNews = catAllNews.slice(0, limit);
                const hasMore = catAllNews.length > limit;

                if (catAllNews.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black uppercase tracking-tighter">
                        {cat}{" "}
                        <span className="text-[#94A3B8] font-normal italic font-serif text-sm">
                          {lang === "TR" ? "dosyası" : "dossier"}
                        </span>
                      </h3>
                      <button
                        onClick={() => setActiveTab(cat)}
                        className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                      >
                        {t.seeMore}
                      </button>
                    </div>
                    <div className="relative group/catscroll">
                      <div
                        id={`scroll-${cat}`}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
                      >
                        {catNews.map((news) => (
                          <motion.div
                            key={`cat-scroll-${news.id}`}
                            whileHover={{ y: -4 }}
                            className="min-w-[200px] md:min-w-[240px] snap-start bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer relative flex flex-col group"
                          >
                            <div
                              onClick={() => handleNewsClick(news.id)}
                            >
                              <div className="relative h-28 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img
                                  src={news.image || FALLBACK_IMAGE}
                                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                                  alt={news.title}
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                  onError={() => handleImageError(news.id)}
                                />
                                <div className="absolute top-2 left-2 flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleBookmark(e, news.id);
                                    }}
                                    className={`p-1 backdrop-blur-md rounded-full z-10 transition-all ${
                                      savedNews.includes(news.id)
                                        ? "bg-red-600 text-white"
                                        : "bg-white/80 text-slate-400 hover:text-red-600"
                                    }`}
                                  >
                                    <Bookmark
                                      size={8}
                                      fill={
                                        savedNews.includes(news.id)
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  </button>
                                </div>
                              </div>
                              <div className="p-3 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[7px] text-red-600 font-black uppercase tracking-widest">
                                    {news.source}
                                  </span>
                                  <span className="text-[7px] text-slate-400 font-bold">
                                    {news.date}
                                  </span>
                                </div>
                                <h4 className="font-bold text-[11px] leading-tight line-clamp-2 dark:text-slate-100 group-hover:text-red-600 transition-colors uppercase">
                                  {news.title}
                                </h4>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {/* Load More Card */}
                        {hasMore && (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            onViewportEnter={() =>
                              !loadingCategories.has(cat) && handleLoadMore(cat)
                            }
                            onClick={() => handleLoadMore(cat)}
                            className="min-w-[220px] snap-start flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-red-500/50 transition-all group"
                          >
                            <div className="text-center">
                              {loadingCategories.has(cat) ? (
                                <div className="flex flex-col items-center gap-3">
                                  <Loader2
                                    className="text-red-600 animate-spin"
                                    size={24}
                                  />
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {t.loading}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-3">
                                  <div className="p-3 bg-white dark:bg-slate-900 rounded-full shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
                                    <Plus size={20} />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-red-600">
                                    {t.seeMore}
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Navigation Arrows */}
                      <button
                        onClick={() => scrollContainer(cat, "left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover/catscroll:opacity-100 transition-all z-10 -ml-5"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => scrollContainer(cat, "right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-slate-900/80 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-md opacity-0 group-hover/catscroll:opacity-100 transition-all z-10 -mr-5"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            /* Filtrelenmiş Grid Görünümü (Bundle Kategori Görünümü) */
            <div>
              <div className="flex items-center justify-between mb-8 border-b border-[#F1F5F9] dark:border-slate-800 pb-4">
                <h3 className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
                  {activeTab}{" "}
                  <span className="text-[#94A3B8] dark:text-slate-500 font-normal italic lowercase font-serif">
                    haberleri
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[300px]">
                <AnimatePresence mode="popLayout">
                  {filteredNews.map((news, idx) => (
                    <motion.div
                      key={news.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{
                        y: -8,
                        scale: 1.02,
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      }}
                      className="bg-white dark:bg-slate-900 rounded-[16px] overflow-hidden border border-[#F1F5F9] dark:border-slate-800 hover:border-red-100 dark:hover:border-red-900 group shadow-sm transition-all duration-300 cursor-pointer relative"
                    >
                      <div
                        onClick={() => handleNewsClick(news.id)}
                        className="flex flex-col h-full"
                      >
                        <div className="relative h-[110px] overflow-hidden bg-[#F1F5F9] dark:bg-slate-800 shrink-0">
                          <img
                            src={news.image || FALLBACK_IMAGE}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 dark:opacity-80 group-hover:opacity-100"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={() => handleImageError(news.id)}
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[7px] font-black uppercase tracking-tighter">
                              {news.source}
                            </div>
                          </div>
                          <button
                            onClick={(e) => toggleBookmark(e, news.id)}
                            className={`absolute top-2 right-2 p-1 backdrop-blur-md rounded-full transition-all shadow-sm ${
                              savedNews.includes(news.id)
                                ? "bg-red-600 text-white"
                                : "bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-red-600"
                            }`}
                          >
                            <Bookmark
                              size={10}
                              fill={
                                savedNews.includes(news.id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        </div>
                        <div className="p-3 text-left flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[7px] text-red-600 font-extrabold uppercase tracking-widest">
                                {news.category}
                              </span>
                              <span className="text-[7px] text-slate-400 font-bold uppercase">
                                {news.source}
                              </span>
                            </div>
                            <h3 className="font-bold text-[11px] leading-tight mb-2 text-[#0F172A] dark:text-slate-100 group-hover:text-red-600 transition-colors line-clamp-2 uppercase">
                              {news.title}
                            </h3>
                          </div>

                          <div className="space-y-2">
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNewsClick(news.id);
                              }}
                              className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[7px] font-black text-red-600 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors group/read"
                            >
                              <span>{t.readNews}</span>
                              <ArrowRight size={8} className="group-hover/read:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-20 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center h-[50px] origin-left">
                  <svg
                    width="55"
                    height="50"
                    viewBox="0 0 160 150"
                    style={{ overflow: "visible" }}
                  >
                    <defs>
                      <linearGradient
                        id={`${uid}-copper-foot`}
                        x1="0%"
                        y1="100%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#9a300e" />
                        <stop offset="50%" stopColor="#cd5521" />
                        <stop offset="100%" stopColor="#e37b42" />
                      </linearGradient>
                      <linearGradient
                        id={`${uid}-glass-foot`}
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#fad0ae" />
                        <stop offset="40%" stopColor="#ea5b11" />
                        <stop offset="100%" stopColor="#7a1400" />
                      </linearGradient>
                      <filter
                        id={`${uid}-shadow-foot`}
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feDropShadow
                          dx="3"
                          dy="5"
                          stdDeviation="4"
                          floodColor="#000"
                          floodOpacity="0.25"
                        />
                      </filter>
                    </defs>
                    <circle cx="20" cy="115" r="7.5" fill={`url(#${uid}-copper-foot)`} />
                    <path
                      d="M 6 92 A 25 25 0 0 1 43 130"
                      fill="none"
                      stroke={`url(#${uid}-copper-foot)`}
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M -8 70 A 45 45 0 0 1 65 135"
                      fill="none"
                      stroke={`url(#${uid}-copper-foot)`}
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 8 65 Q 150 -50 420 50"
                      fill="none"
                      stroke={`url(#${uid}-copper-foot)`}
                      strokeWidth="6.5"
                      strokeLinecap="round"
                    />
                    <polygon
                      points="75,70 105,90 75,110"
                      fill={`url(#${uid}-glass-foot)`}
                      filter={`url(#${uid}-shadow-foot)`}
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <div
                    className="font-display font-bold text-[#1a273b] dark:text-slate-100 uppercase tracking-tight relative top-[5px] -ml-9"
                    style={{
                      fontSize: "1.6rem",
                      textShadow: isDarkMode
                        ? "none"
                        : "0.5px 0.5px 1px rgba(255, 255, 255, 0.8), -0.5px -0.5px 1px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    SON<span className="text-orange-600">ARAT</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
                {t.footerText}
              </p>
              <div className="flex gap-4">
                <Twitter
                  className="cursor-pointer text-slate-400 hover:text-red-600 transition-colors"
                  size={18}
                />
                <Facebook
                  className="cursor-pointer text-slate-400 hover:text-red-600 transition-colors"
                  size={18}
                />
                <Share2
                  className="cursor-pointer text-slate-400 hover:text-red-600 transition-colors"
                  size={18}
                />
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                {t.categories[0]}
              </h4>
              <ul className="space-y-3 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {t.categories.slice(0, 6).map((c) => (
                  <li
                    key={`foot-${c}`}
                    onClick={() => setActiveTab(c)}
                    className="cursor-pointer hover:text-red-600 transition-colors"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                {t.corporate}
              </h4>
              <ul className="space-y-3 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                <li className="cursor-pointer hover:text-red-600 transition-colors">
                  {t.aboutUs}
                </li>
                <li className="cursor-pointer hover:text-red-600 transition-colors">
                  {t.team}
                </li>
                <li className="cursor-pointer hover:text-red-600 transition-colors">
                  {t.contact}
                </li>
                <li className="cursor-pointer hover:text-red-600 transition-colors">
                  {t.privacy}
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              © 2026 SONARAT - {t.rights}
            </p>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Globe size={10} />{" "}
                {lang === "TR" ? "Türkçe (TR)" : "English (EN)"}
              </span>
              <span>{t.dataPolicy}</span>
            </div>
          </div>
        </footer>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
