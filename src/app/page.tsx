'use client';

import React, { useState, useEffect } from 'react';
import { Campaign } from '@/types';
import { ApiClient } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { CampaignCard } from '@/components/CampaignCard';
import { CommitmentModal } from '@/components/CommitmentModal';
import {
  Users,
  ShieldCheck,
  TrendingDown,
  QrCode,
  ArrowRight,
  Filter,
  CheckCircle,
  Truck,
  Search,
  MapPin,
  Sparkles,
  PartyPopper,
  Radio,
} from 'lucide-react';

export default function Home() {
  const { t, language } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get<Campaign[]>('/campaigns');
      if (res.success && res.data) {
        setCampaigns(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Real-Time Server-Sent Events (SSE) Stream
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${apiUrl}/campaigns/stream/live`);
      eventSource.addEventListener('POOL_UPDATED', (e) => {
        try {
          const update = JSON.parse(e.data);
          setCampaigns((prev) =>
            prev.map((c) =>
              c.id === update.campaignId
                ? {
                    ...c,
                    committedQuantity: update.committedQuantity ?? c.committedQuantity,
                    targetQuantity: update.targetQuantity ?? c.targetQuantity,
                    progressPercent: update.progressPercent ?? c.progressPercent,
                    remainingQuantity: update.remainingQuantity ?? c.remainingQuantity,
                    status: update.status ?? c.status,
                  }
                : c
            )
          );
        } catch {}
      });

      eventSource.addEventListener('POOL_LOCKED', (e) => {
        try {
          const lockedData = JSON.parse(e.data);
          setCelebrationMsg(
            language === 'bn'
              ? `🎉 দারুণ সুখবর! "${lockedData.title}" পুলটি ১০০% পূর্ণ হয়েছে এবং সরবরাহের জন্য লক করা হয়েছে!`
              : `🎉 Congratulations! "${lockedData.title}" has reached 100% capacity and is now locked for fulfillment!`
          );
          setTimeout(() => setCelebrationMsg(null), 8000);
          fetchCampaigns();
        } catch {}
      });
    } catch {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [language]);

  const categories = ['ALL', 'Grains & Rice', 'Edible Oils', 'Dairy & Poultry', 'Pulses & Spices'];

  // Extract unique cities from active campaigns
  const cities = ['ALL', ...Array.from(new Set(campaigns.map((c) => c.pickupHub?.city).filter(Boolean)))];

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      c.product.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesCity =
      selectedCity === 'ALL' ||
      c.pickupHub?.city.toLowerCase() === selectedCity.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.pickupHub?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pickupHub?.area.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Live Pool Locked Celebration Banner */}
      {celebrationMsg && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white py-3 px-4 text-center font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 animate-bounce sticky top-16 z-30">
          <PartyPopper className="w-5 h-5 shrink-0" />
          <span>{celebrationMsg}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_70%)]" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            {t.heroBadge}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            {t.heroTitlePrefix} <span className="text-emerald-400">{t.heroTitleHighlight}</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.heroDescription}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#pools"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition flex items-center gap-2"
            >
              {t.exploreBtn}
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition"
            >
              {t.howItWorksBtn}
            </a>
          </div>

          {/* Social Proof / Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-800/80 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <p className="text-2xl font-black text-emerald-400">25–40%</p>
              <p className="text-xs text-slate-400 mt-1">{t.statDiscount}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <p className="text-2xl font-black text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">{t.statRefund}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <p className="text-2xl font-black text-emerald-400">QR-Code</p>
              <p className="text-xs text-slate-400 mt-1">{t.statQr}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <p className="text-2xl font-black text-emerald-400">Double-Entry</p>
              <p className="text-xs text-slate-400 mt-1">{t.statLedger}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Group-Buying Pools Section */}
      <section id="pools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  {t.poolsSubtitle}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
                  Live Sync Active
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {t.poolsTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t.poolsHint}
              </p>
            </div>

            {/* City Dropdown Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city === 'ALL' ? t.allLocations : city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar + Category Filter Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? t.allCategories : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Campaign Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onCommitClick={(c) => setSelectedCampaign(c)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {t.noPoolsFound}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSelectedCity('ALL');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              {t.resetFilters}
            </button>
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              {language === 'bn' ? 'সহজ চার ধাপ' : 'Frictionless Process'}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {language === 'bn' ? 'গ্রুপ-বায়িং কীভাবে কাজ করে' : 'How Community Group-Buying Works'}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {language === 'bn'
                ? 'BazarPool সমন্বয়হীনতা ও মধ্যস্বত্বভোগীদের বাড়তি খরচ দূর করে স্বচ্ছ চার ধাপে সাশ্রয়ী বাজার নিশ্চিত করে।'
                : 'BazarPool solves coordination friction, payment tracking, and bulk distribution in four transparent steps.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                {language === 'bn' ? 'সাপ্লায়ার পুল লঞ্চ করেন' : 'Suppliers Launch Pool'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'bn'
                  ? 'পাইকাররা সরাসরি মিল রেটে নির্দিষ্ট পরিমাণ পণ্য (যেমন ৫০ বস্তা চাল) বিক্রির জন্য পুল খোলেন।'
                  : 'Wholesalers list staple products with minimum target volumes (e.g. 50 sacks of rice) and heavy wholesale discounts.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                {language === 'bn' ? 'ক্রেতারা অংশ নেন' : 'Consumers Commit'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'bn'
                  ? 'পরিবার বা মেস ম্যানেজাররা ক্ষুদ্র পরিমাণে (১-৩ বস্তা) অংশ নেন। ওয়ালেটে টাকা সংরক্ষিত থাকে।'
                  : 'Households and students commit small portions (1–3 sacks). Funds are securely reserved in your virtual wallet.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                {language === 'bn' ? 'টার্গেট পূরণ ও লক' : 'Target Met & Locked'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'bn'
                  ? '১০০% টার্গেট পূর্ণ হলে স্বয়ংক্রিয়ভাবে লক হয়ে যায় এবং সাপ্লায়ার স্থানীয় পিকআপ হাবে পণ্য পাঠান।'
                  : 'Once 100% committed, the campaign locks automatically! Supplier dispatches orders directly to local neighborhood hubs.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center mb-4">
                04
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                {language === 'bn' ? 'কিউআর হাবে পিকআপ' : 'QR Hub Pickup'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'bn'
                  ? 'ক্রেতারা তাদের ডিজিটাল কিউআর পাস দেখিয়ে হাব থেকে সহজেই পণ্য বুঝে নেন।'
                  : 'Consumers show their cryptographic QR pickup pass to the hub coordinator for instant hand-over verification.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Modal */}
      {selectedCampaign && (
        <CommitmentModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSuccess={() => {
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
}
