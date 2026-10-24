'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useLanguage } from '@/lib/i18n';
import { ApiClient } from '@/lib/api';
import { Notification } from '@/types';
import {
  ShoppingBag,
  Wallet,
  User,
  LogOut,
  ShieldCheck,
  Bell,
  Check,
  Menu,
  X,
  Sparkles,
  Globe,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, wallet, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await ApiClient.get<{ notifications: Notification[]; unreadCount: number }>('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await ApiClient.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await ApiClient.patch(`/notifications/${id}/read`);
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // ignore
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Bazar<span className="text-emerald-600">Pool</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest -mt-1">
                  {t.brandSub}
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link href="/#pools" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                {t.navPools}
              </Link>
              <Link href="/#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                {t.navHow}
              </Link>
              {user && (
                <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                  {t.navDashboard}
                </Link>
              )}
              {user && (user.role === 'HUB_COORDINATOR' || user.role === 'ADMIN') && (
                <Link
                  href="/pickup-verifier"
                  className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t.navScanner}
                </Link>
              )}
            </div>
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              title="Switch Language / ভাষা পরিবর্তন করুন"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {user ? (
              <>
                {/* Live Wallet Pill */}
                <Link
                  href="/dashboard?tab=wallet"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition"
                  title="View Virtual Wallet"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>
                    ৳{wallet ? wallet.availableBalance.toLocaleString() : '0.00'}
                  </span>
                </Link>

                {/* Notifications Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover Panel */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 py-2">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkSingleRead(n.id)}
                              className={`p-2.5 rounded-xl cursor-pointer transition ${
                                !n.isRead ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                                  {n.title}
                                </h5>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {n.message}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Role Badge & Profile */}
                <div className="flex items-center gap-2 pl-2">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:ring-2 hover:ring-emerald-500 transition"
                  >
                    <User className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <Link
              href="/#pools"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 px-2 py-1"
            >
              Active Campaigns
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 px-2 py-1"
            >
              How It Works
            </Link>
            {user && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-slate-700 dark:text-slate-200 px-2 py-1"
              >
                Dashboard
              </Link>
            )}
            {user && (user.role === 'HUB_COORDINATOR' || user.role === 'ADMIN') && (
              <Link
                href="/pickup-verifier"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-amber-600 px-2 py-1"
              >
                QR Pickup Scanner
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
