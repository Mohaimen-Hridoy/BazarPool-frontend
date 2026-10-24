'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import { useLanguage } from '@/lib/i18n';
import { ApiClient } from '@/lib/api';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  CameraOff,
  Upload,
  User,
  Package,
  Calendar,
  Clock,
  Printer,
} from 'lucide-react';

export default function PickupVerifierPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tokenCode, setTokenCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Camera Scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this browser or connection.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // Check if browser has native BarcodeDetector
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code'],
        });

        const scanFrame = async () => {
          if (!streamRef.current || !videoRef.current) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawVal = barcodes[0].rawValue;
              try {
                // If it's a JSON payload
                const parsed = JSON.parse(rawVal);
                if (parsed.tokenCode) {
                  setTokenCode(parsed.tokenCode);
                  stopCamera();
                  return;
                }
              } catch {
                // Raw text token
                if (rawVal.startsWith('BP-')) {
                  setTokenCode(rawVal);
                  stopCamera();
                  return;
                }
              }
            }
          } catch {
            // ignore frame error
          }
          if (streamRef.current) {
            requestAnimationFrame(scanFrame);
          }
        };
        requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      setCameraError(err.message || 'Unable to access camera.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenCode.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await ApiClient.post<any>('/fulfillment/verify-pickup', {
        tokenCode: tokenCode.trim(),
        notes: 'Verified and collected at local community hub.',
      });

      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <QrCode className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {t.verifierTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.verifierSub}
          </p>
        </div>

        {/* Verification Form Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Camera Scanner Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                {t.liveCamera}
              </span>

              {cameraActive ? (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1 rounded-xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-xs font-bold flex items-center gap-1 transition"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  {t.turnOffCamera}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {t.openCamera}
                </button>
              )}
            </div>

            {cameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-emerald-500/60 shadow-inner">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                <div className="absolute inset-0 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none m-8 animate-pulse" />
                <span className="absolute bottom-3 px-3 py-1 bg-black/70 backdrop-blur rounded-full text-[10px] text-white">
                  {t.pointCamera}
                </span>
              </div>
            )}

            {cameraError && (
              <p className="text-xs text-red-500 mt-2 font-medium">{cameraError}</p>
            )}
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {t.enterToken}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={tokenCode}
                  onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BP-A3B9-9C12"
                  className="w-full font-mono text-lg font-bold px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !tokenCode.trim()}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5" />
              {loading ? t.validatingBtn : t.authorizeBtn}
            </button>
          </form>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Authorization Rejected</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Success Card with Order & Consumer Breakdown */}
          {result && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <h3 className="text-base font-extrabold">{result.message}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/40 transition"
                  title="Print Handover Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200 dark:border-emerald-800/80">
                <div>
                  <span className="text-slate-500">Consumer Name:</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {result.order.consumer.fullName}
                  </p>
                  <p className="text-slate-500 text-[11px]">{result.order.consumer.phone}</p>
                </div>

                <div>
                  <span className="text-slate-500">Handover Quantity:</span>
                  <p className="font-bold text-emerald-700 dark:text-emerald-300 text-base">
                    {result.order.totalQuantity} {result.order.campaign.product.unit}
                  </p>
                  <p className="text-slate-500 text-[11px]">{result.order.campaign.product.title}</p>
                </div>

                <div>
                  <span className="text-slate-500">Order Reference:</span>
                  <p className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    #{result.order.id.slice(0, 8)}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500">Verification Timestamp:</span>
                  <p className="text-slate-700 dark:text-slate-300">
                    {new Date(result.pickupRecord.collectedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300/40 text-[11px] text-emerald-800 dark:text-emerald-200">
                ✓ Product handover officially logged in immutable pickup record #{result.pickupRecord.id.slice(0, 8)}.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
