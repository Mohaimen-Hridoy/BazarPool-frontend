'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Campaign } from '@/types';
import { useAuth } from '@/lib/authContext';
import { useLanguage } from '@/lib/i18n';
import { ApiClient } from '@/lib/api';
import {
  X,
  ShieldCheck,
  Wallet,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  Zap,
  LogIn,
  UserCheck,
} from 'lucide-react';

interface CommitmentModalProps {
  campaign: Campaign | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CommitmentModal: React.FC<CommitmentModalProps> = ({
  campaign,
  onClose,
  onSuccess,
}) => {
  const { user, wallet, refreshUser } = useAuth();
  const { t, language } = useLanguage();
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [topUpLoading, setTopUpLoading] = useState(false);

  if (!campaign) return null;

  const totalCost = quantity * campaign.unitPrice;
  const userBalance = wallet?.availableBalance || 0;
  const isBalanceSufficient = userBalance >= totalCost;
  const remainingCap = campaign.remainingQuantity;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const handleCommit = async () => {
    if (!user) {
      setError(
        language === 'bn'
          ? 'কমিউনিটি পাইকারি পুলে যোগ দিতে অনুগ্রহ করে আগে লগইন করুন।'
          : 'Please sign in or create an account to join this group-buying pool.'
      );
      return;
    }

    if (quantity > remainingCap) {
      setError(`Cannot commit ${quantity} units. Only ${remainingCap} units remain in this pool.`);
      return;
    }

    if (!isBalanceSufficient) {
      setError(
        language === 'bn'
          ? 'পর্যাপ্ত ওয়ালেট ব্যালেন্স নেই। অনুগ্রহ করে bKash দিয়ে টপ-আপ করুন।'
          : 'Insufficient wallet balance. Please simulate a top-up first.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ApiClient.post<any>(`/commitments/${campaign.id}`, {
        quantity,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        await refreshUser();
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place commitment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTopUp = async () => {
    if (!user) {
      setError(
        language === 'bn'
          ? 'ওয়ালেট টপ-আপ করার জন্য আগে আপনার অ্যাকাউন্টে লগইন করুন।'
          : 'Please sign in first to top up your virtual wallet.'
      );
      return;
    }

    setTopUpLoading(true);
    setError(null);
    try {
      await ApiClient.post('/wallet/mfs-checkout', {
        amount: Math.max(3000, totalCost - userBalance),
        method: 'BKASH',
        senderNumber: '01700000000',
        senderTrxId: `TRX${Date.now().toString().slice(-6)}`,
      });
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Top up simulation failed.');
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {successMsg ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Commitment Confirmed!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              {successMsg}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                Join Community Wholesale Pool
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                {campaign.title}
              </h2>
              <p className="text-xs text-slate-500">
                Hub: {campaign.pickupHub.name} ({campaign.pickupHub.city})
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.selectQuantity} ({campaign.product.unit})
                </label>
                <span className="text-xs text-slate-500">
                  Max: {Math.min(campaign.maxCommitmentQty, remainingCap)} {campaign.product.unit}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={quantity <= campaign.minCommitmentQty}
                  onClick={() => setQuantity((q) => Math.max(campaign.minCommitmentQty, q - 1))}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-100 transition disabled:opacity-40"
                >
                  -
                </button>

                <div className="flex-1 text-center font-bold text-xl text-slate-900 dark:text-white">
                  {quantity} <span className="text-xs text-slate-400 font-normal">{campaign.product.unit}</span>
                </div>

                <button
                  type="button"
                  disabled={quantity >= Math.min(campaign.maxCommitmentQty, remainingCap)}
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(campaign.maxCommitmentQty, remainingCap, q + 1)
                    )
                  }
                  className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-lg flex items-center justify-center hover:bg-slate-100 transition disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Price Calculation Summary */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>{t.unitPriceLabel}:</span>
                  <span>৳{campaign.unitPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm pt-1">
                  <span>{t.totalAmountLabel}:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ৳{totalCost.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Balance or Unauthenticated Notice */}
            {!user ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/60 mb-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {language === 'bn' ? 'পুলে যোগ দিতে লগইন প্রয়োজন' : 'Sign In Required to Join Pool'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {language === 'bn'
                        ? 'পাইকারি মূল্যে পণ্য সংরক্ষণ করতে এবং ডিজিটাল QR পিকআপ পাস পেতে আপনার অ্যাকাউন্টে লগইন করুন।'
                        : 'Please sign in or create an account to reserve products at wholesale pricing and receive your digital QR pickup pass.'}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-amber-200/60 dark:border-amber-800/40">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(currentPath)}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'লগইন বা রেজিস্টার করুন' : 'Sign In or Create Account'}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between mb-5 text-xs">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {t.navWallet}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t.availableWalletBalance}: ৳{userBalance.toLocaleString()}
                    </p>
                  </div>
                </div>

                {!isBalanceSufficient && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulateTopUp}
                      disabled={topUpLoading}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 font-bold text-[11px] hover:bg-pink-100 transition border border-pink-200 dark:border-pink-800 disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {topUpLoading ? '...' : `⚡ bKash Top-Up`}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Commit / Sign In Button */}
            {!user ? (
              <Link
                href={`/login?redirect=${encodeURIComponent(currentPath)}`}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                {language === 'bn'
                  ? `লগইন করে কমিট করুন (৳${totalCost.toLocaleString()})`
                  : `Sign In to Commit (৳${totalCost.toLocaleString()})`}
              </Link>
            ) : (
              <button
                onClick={handleCommit}
                disabled={loading || !isBalanceSufficient}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {loading ? 'Securing Funds & Reserving...' : `${t.confirmCommitment} (৳${totalCost.toLocaleString()})`}
              </button>
            )}

            <p className="text-[10px] text-center text-slate-400 mt-3">
              Funds are held in your reserved virtual wallet balance. If the pool expires before the target is reached, 100% of funds are automatically credited back.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
