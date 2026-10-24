'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ApiClient } from '@/lib/api';
import { ShoppingBag, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await ApiClient.post<any>('/auth/login', { email, password });
      if (res.success && res.data) {
        login(res.data.token, res.data.user, res.data.wallet);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome to BazarPool
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your wholesale group-buying dashboard & wallet
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. consumer@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Logins for Evaluator/Interviewer */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5" />
            Quick Demo Accounts (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('consumer@gmail.com')}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 text-left border border-slate-200 dark:border-slate-700"
            >
              <span className="font-bold block text-emerald-600">Consumer</span>
              <span className="text-[10px] text-slate-400 truncate block">consumer@gmail.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('supplier@agrofarm.com')}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 text-left border border-slate-200 dark:border-slate-700"
            >
              <span className="font-bold block text-amber-600">Wholesaler</span>
              <span className="text-[10px] text-slate-400 truncate block">supplier@agrofarm.com</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('coordinator@dhanmondi.com')}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 text-left border border-slate-200 dark:border-slate-700"
            >
              <span className="font-bold block text-blue-600">Hub Coordinator</span>
              <span className="text-[10px] text-slate-400 truncate block">coordinator@...</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@bazarpool.com')}
              className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 text-left border border-slate-200 dark:border-slate-700"
            >
              <span className="font-bold block text-purple-600">Admin</span>
              <span className="text-[10px] text-slate-400 truncate block">admin@bazarpool.com</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don’t have an account?{' '}
          <Link href="/register" className="font-bold text-emerald-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
