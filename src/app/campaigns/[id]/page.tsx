'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Campaign } from '@/types';
import { ApiClient } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';
import { CommitmentModal } from '@/components/CommitmentModal';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  Users,
  Lock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  UserCheck,
  Phone,
  Sparkles,
  MessageCircle,
  Send,
  Navigation,
  ExternalLink,
  Radio,
} from 'lucide-react';

function CampaignDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCommitModal, setShowCommitModal] = useState(false);

  // Community Q&A State
  const [questions, setQuestions] = useState([
    {
      id: 1,
      user: 'Rahim (Hostel Mess Manager)',
      question:
        language === 'bn'
          ? 'চালের আর্দ্রতা ও পলিশের মান কেমন? বস্তার প্যাকেজিং কি ওয়াটারপ্রুফ?'
          : 'What is the moisture grade and polish? Is the bulk sack waterproof?',
      answer:
        language === 'bn'
          ? 'এটি দিনাজপুর থেকে সরাসরি আনা শতভাগ অটো-মিল্ড মিনিকেট। ১২% এর নিচে আর্দ্রতা এবং ডাবল-লেয়ার নিরাপদ বস্তায় সিল করা।'
          : '100% freshly auto-milled Dinajpur Miniket, export grade moisture under 12% in double-layer moisture-proof woven sacks.',
      time: '2 hours ago',
    },
    {
      id: 2,
      user: 'Tanvir (Student Coordinator)',
      question:
        language === 'bn'
          ? 'অফিস বা ক্লাসের পর রাত ৮টার দিকে কি পিকআপ করা যাবে?'
          : 'Can community members pick up in the evening after 8 PM?',
      answer:
        language === 'bn'
          ? 'হ্যাঁ, আমাদের প্রতিটি স্থানীয় কমিউনিটি হাব রাত ৯:৩০ পর্যন্ত খোলা থাকে।'
          : 'Yes, designated neighborhood hubs stay open until 9:30 PM for smooth collection.',
      time: '5 hours ago',
    },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.get<Campaign>(`/campaigns/${campaignId}`);
      if (res.success && res.data) {
        setCampaign(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load campaign details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  // Real-Time SSE Stream for live progress updates on this pool
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${apiUrl}/campaigns/stream/live`);
      eventSource.addEventListener('POOL_UPDATED', (e) => {
        try {
          const update = JSON.parse(e.data);
          if (update.campaignId === campaignId) {
            setCampaign((prev) =>
              prev
                ? {
                    ...prev,
                    committedQuantity: update.committedQuantity ?? prev.committedQuantity,
                    targetQuantity: update.targetQuantity ?? prev.targetQuantity,
                    progressPercent: update.progressPercent ?? prev.progressPercent,
                    remainingQuantity: update.remainingQuantity ?? prev.remainingQuantity,
                    status: update.status ?? prev.status,
                  }
                : null
            );
          }
        } catch {}
      });
    } catch {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [campaignId]);

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setQuestions((prev) => [
      {
        id: Date.now(),
        user: 'Community Member',
        question: newQuestionText.trim(),
        answer:
          language === 'bn'
            ? 'ধন্যবাদ! সরবরাহকারী বা হাব লিড শীঘ্রই উত্তর দেবেন।'
            : 'Thank you! The verified wholesale supplier will answer shortly.',
        time: 'Just now',
      },
      ...prev,
    ]);
    setNewQuestionText('');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium tracking-wide">Loading Pool Details...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pool Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This wholesale pool could not be found or has been removed.'}</p>
        <Link
          href="/#pools"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.backToPools}
        </Link>
      </div>
    );
  }

  const defaultImage =
    campaign.product.images?.[0] ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const isLocked = campaign.status === 'LOCKED';
  const isFulfilled = campaign.status === 'COMPLETED' || campaign.status === 'AT_HUB';
  const isExpired = campaign.status === 'EXPIRED' || campaign.status === 'REFUNDED';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/#pools" className="hover:text-emerald-600 flex items-center gap-1 font-semibold transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.backToPools}
          </Link>
          <span>/</span>
          <span className="text-slate-400">{campaign.product.category}</span>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs">{campaign.title}</span>
        </div>

        {/* Main Grid: Left Details & Right Action Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols): Image + Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image Container */}
            <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-900">
              <img
                src={defaultImage}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 backdrop-blur shadow-sm">
                  {campaign.product.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/90 text-white backdrop-blur shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.directSource}
                </span>
              </div>

              <div className="absolute top-4 right-4">
                {campaign.status === 'OPEN' && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-500 text-white shadow-md animate-pulse">
                    {t.openForCommitments}
                  </span>
                )}
                {isLocked && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-500 text-white shadow-md flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    {t.targetMetLocked}
                  </span>
                )}
                {isFulfilled && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-blue-500 text-white shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.inFulfillment}
                  </span>
                )}
                {isExpired && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-red-500 text-white shadow-md flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {t.expiredRefunded}
                  </span>
                )}
              </div>

              {/* Title & Hub on image bottom */}
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <h1 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-md">
                  {campaign.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {t.pickupHubLabel}: {campaign.pickupHub.name} ({campaign.pickupHub.area}, {campaign.pickupHub.city})
                  </span>
                </div>
              </div>
            </div>

            {/* Product & Campaign Description */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.aboutOpportunity}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {campaign.description || campaign.product.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.commodityUnit}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 mt-0.5 block capitalize">
                    {campaign.product.unit}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.minCommitment}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                    {campaign.minCommitmentQty} {campaign.product.unit}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.maxPerMember}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                    {campaign.maxCommitmentQty} {campaign.product.unit}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">{t.timeLeft}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {daysLeft > 0 ? `${daysLeft} Days` : t.endingToday}
                  </span>
                </div>
              </div>
            </div>

            {/* Designated Pickup Hub & Interactive Geolocation Preview Card */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {t.designatedHubTitle}
                    </h3>
                    <p className="text-xs text-slate-500">{t.designatedHubSub}</p>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${campaign.pickupHub.name}, ${campaign.pickupHub.address}, ${campaign.pickupHub.city}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5 hover:bg-emerald-100 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Google Maps Directions
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Visual Map Radar Widget */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-inner">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-xs font-bold text-emerald-300">Neighborhood Distribution Point Active</span>
                  </div>
                  <p className="font-black text-sm text-white">{campaign.pickupHub.name}</p>
                  <p className="text-xs text-slate-300">{campaign.pickupHub.address}</p>
                </div>
                <div className="text-center sm:text-right bg-black/40 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Hub Coordinator Helpline</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-0.5">{campaign.pickupHub.contactPhone}</span>
                </div>
              </div>
            </div>

            {/* Supplier / Wholesaler Card */}
            {campaign.supplier && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-lg">
                    {campaign.supplier.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {campaign.supplier.fullName}
                      </h4>
                      <span className="p-0.5 rounded-full bg-emerald-500 text-white">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{t.verifiedSupplier}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    {t.trustedPartner}
                  </span>
                </div>
              </div>
            )}

            {/* Community Q&A / Discussion Thread */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {language === 'bn' ? 'কমিউনিটি আলোচনা ও প্রশ্নোত্তর' : 'Community Discussion & Q&A'}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">{questions.length} questions</span>
              </div>

              {/* Ask Question Input */}
              <form onSubmit={handlePostQuestion} className="flex gap-2">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'পণ্য, মান বা সংগ্রহ সম্পর্কে প্রশ্ন জিজ্ঞাসা করুন...'
                      : 'Ask a question about commodity quality, delivery schedule...'
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!newQuestionText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'পোস্ট করুন' : 'Post'}
                </button>
              </form>

              {/* Discussion List */}
              <div className="space-y-3 pt-2 divide-y divide-slate-100 dark:divide-slate-800">
                {questions.map((q) => (
                  <div key={q.id} className="pt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{q.user}</span>
                      <span className="text-[10px] text-slate-400">{q.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Q: {q.question}</p>
                    <div className="pl-3 border-l-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-r-xl">
                      <p className="text-emerald-800 dark:text-emerald-300 font-semibold">
                        A: {q.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Pricing, Pool Progress, and Commit Action */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-xl space-y-6 sticky top-24">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  {t.collectiveWholesalePrice}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    ৳{campaign.unitPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    /{campaign.product.unit}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {t.saveVsRetail}
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-400">{t.poolProgress}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{campaign.progressPercent}%</span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isLocked ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, campaign.progressPercent)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-500 pt-1">
                  <span>
                    <strong>{campaign.committedQuantity}</strong> {t.committed}
                  </span>
                  <span>
                    Goal: <strong>{campaign.targetQuantity} {campaign.product.unit}</strong>
                  </span>
                </div>

                <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-700 text-xs">
                  {campaign.remainingQuantity > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {campaign.remainingQuantity} {campaign.product.unit} {t.left}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold">{t.goalAchieved}</span>
                  )}
                </div>
              </div>

              {/* Commit Action Button */}
              {campaign.status === 'OPEN' ? (
                <button
                  onClick={() => setShowCommitModal(true)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {t.joinPoolBtn}
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-center text-xs space-y-1">
                  <Lock className="w-5 h-5 text-amber-500 mx-auto" />
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    This pool is {campaign.status}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {isLocked && 'Target volume reached! Supplier is preparing wholesale dispatch.'}
                    {isFulfilled && 'Dispatched orders have arrived at the designated hub for collection.'}
                    {isExpired && 'Campaign expired without meeting target. All funds auto-refunded.'}
                  </p>
                </div>
              )}

              {/* Guarantee Bullet Points */}
              <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.refundGuarantee}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.atomicLedgerGuarantee}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t.securePassGuarantee}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commitment Modal */}
      {showCommitModal && (
        <CommitmentModal
          campaign={campaign}
          onClose={() => setShowCommitModal(false)}
          onSuccess={() => {
            fetchCampaign();
          }}
        />
      )}
    </div>
  );
}

export default function CampaignDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">Loading Pool Details...</p>
        </div>
      }
    >
      <CampaignDetailsContent />
    </Suspense>
  );
}
