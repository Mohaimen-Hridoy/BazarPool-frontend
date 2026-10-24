'use client';

import React from 'react';
import Link from 'next/link';
import { Campaign } from '@/types';
import { MapPin, Clock, Users, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  onCommitClick?: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onCommitClick }) => {
  const isLocked = campaign.status === 'LOCKED';
  const isExpired = campaign.status === 'EXPIRED' || campaign.status === 'REFUNDED';
  const isFulfilled = campaign.status === 'COMPLETED' || campaign.status === 'AT_HUB';

  const defaultImage =
    campaign.product.images?.[0] ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Card Header Image & Status Tag */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={defaultImage}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badges on top */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 backdrop-blur shadow-sm">
              {campaign.product.category}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            {campaign.status === 'OPEN' && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-md shadow-emerald-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                ACTIVE POOL
              </span>
            )}
            {campaign.status === 'LOCKED' && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md">
                <Lock className="w-3 h-3" />
                LOCKED (TARGET MET)
              </span>
            )}
            {isFulfilled && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500 text-white shadow-md">
                <CheckCircle2 className="w-3 h-3" />
                FULFILLMENT
              </span>
            )}
          </div>

          {/* Price overlay on image bottom */}
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-[11px] font-medium text-emerald-300">Wholesale Unit Price</p>
            <p className="text-xl font-extrabold tracking-tight">
              ৳{campaign.unitPrice.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-300">/{campaign.product.unit}</span>
            </p>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
            {campaign.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
            {campaign.description || campaign.product.description}
          </p>

          {/* Hub & City */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              {campaign.pickupHub.name} ({campaign.pickupHub.area}, {campaign.pickupHub.city})
            </span>
          </div>

          {/* Group-Buying Progress Bar */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Pool Progress</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {campaign.progressPercent}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isLocked ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, campaign.progressPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>
                Committed: <strong className="text-slate-900 dark:text-white">{campaign.committedQuantity}</strong> / {campaign.targetQuantity} {campaign.product.unit}
              </span>
              <span>
                {campaign.remainingQuantity > 0 ? (
                  <span className="text-amber-600 font-semibold">{campaign.remainingQuantity} left</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">Goal Achieved!</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer / Actions */}
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{daysLeft > 0 ? `${daysLeft} days remaining` : 'Ending today'}</span>
          </div>

          {campaign.status === 'OPEN' ? (
            <button
              onClick={() => onCommitClick && onCommitClick(campaign)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            >
              Commit Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href={`/campaigns/${campaign.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              View Pool Details
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
