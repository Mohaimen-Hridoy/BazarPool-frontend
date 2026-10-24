'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { ApiClient } from '@/lib/api';
import { Commitment, Campaign, Product, PickupHub, AdminStats } from '@/types';
import {
  Wallet,
  Clock,
  QrCode,
  PlusCircle,
  Truck,
  CheckCircle,
  Package,
  ArrowUpRight,
  ShieldCheck,
  X,
  Lock,
  Building,
  BarChart3,
  Users,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  Ban,
  CheckCircle2,
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, wallet, refreshUser, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'commitments' | 'wallet' | 'campaigns' | 'products' | 'admin'>('commitments');
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [supplierCampaigns, setSupplierCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hubs, setHubs] = useState<PickupHub[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedQrOrder, setSelectedQrOrder] = useState<any | null>(null);

  // Top Up state
  const [topUpAmount, setTopUpAmount] = useState<number>(3000);
  const [topUpLoading, setTopUpLoading] = useState(false);

  // New Campaign Form state
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({
    productId: '',
    pickupHubId: '',
    title: '',
    description: '',
    unitPrice: 0,
    targetQuantity: 30,
    minCommitmentQty: 1,
    maxCommitmentQty: 5,
    deadline: '',
  });

  // New Product Form state
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProductData, setNewProductData] = useState({
    title: '',
    description: '',
    category: 'Grains & Rice',
    unit: 'kg',
    images: '',
  });

  // New Hub Form state
  const [showNewHubModal, setShowNewHubModal] = useState(false);
  const [newHubData, setNewHubData] = useState({
    name: '',
    address: '',
    city: 'Dhaka',
    area: '',
    contactPhone: '',
  });

  // Read URL query params (e.g. ?tab=wallet)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['commitments', 'wallet', 'campaigns', 'products', 'admin'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'CONSUMER' || user.role === 'ADMIN') {
        const res = await ApiClient.get<Commitment[]>('/commitments/me');
        if (res.success && res.data) setCommitments(res.data);
      }

      if (user.role === 'SUPPLIER' || user.role === 'ADMIN') {
        const [cRes, pRes, hRes] = await Promise.all([
          ApiClient.get<Campaign[]>(`/campaigns?supplierId=${user.id}`),
          ApiClient.get<Product[]>(`/products?supplierId=${user.id}`),
          ApiClient.get<PickupHub[]>('/admin/hubs'),
        ]);
        if (cRes.success && cRes.data) setSupplierCampaigns(cRes.data);
        if (pRes.success && pRes.data) setProducts(pRes.data);
        if (hRes.success && hRes.data) setHubs(hRes.data);
      }

      if (user.role === 'ADMIN') {
        const [statsRes, allHubsRes] = await Promise.all([
          ApiClient.get<AdminStats>('/admin/stats'),
          ApiClient.get<PickupHub[]>('/admin/hubs'),
        ]);
        if (statsRes.success && statsRes.data) setAdminStats(statsRes.data);
        if (allHubsRes.success && allHubsRes.data) setHubs(allHubsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSimulateTopUp = async () => {
    setTopUpLoading(true);
    try {
      await ApiClient.post('/wallet/top-up', { amount: topUpAmount });
      await refreshUser();
      alert(`৳${topUpAmount.toLocaleString()} added to your virtual wallet balance.`);
    } catch (err: any) {
      alert(err.message || 'Top-up failed');
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleCancelCommitment = async (commitmentId: string) => {
    if (!confirm('Are you sure you want to cancel this commitment? Reserved funds will be immediately restored to your available wallet balance.')) {
      return;
    }
    try {
      const res = await ApiClient.post<any>(`/commitments/${commitmentId}/cancel`);
      if (res.success) {
        alert('Commitment successfully cancelled and funds restored.');
        await refreshUser();
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel commitment.');
    }
  };

  const handleDispatchCampaign = async (campaignId: string) => {
    try {
      const res = await ApiClient.post<any>(`/fulfillment/${campaignId}/dispatch`);
      if (res.success) {
        alert('Campaign marked as DISPATCHED to pickup hub!');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Dispatch failed');
    }
  };

  const handleArriveAtHub = async (campaignId: string) => {
    try {
      const res = await ApiClient.post<any>(`/fulfillment/${campaignId}/arrive-at-hub`);
      if (res.success) {
        alert('Campaign marked as ARRIVED AT HUB! Associated consumer orders are now READY FOR PICKUP.');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to mark as arrived at hub');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignData.productId || !newCampaignData.pickupHubId) {
      alert('Please select both a Product and a Pickup Hub.');
      return;
    }
    try {
      const res = await ApiClient.post<any>('/campaigns', {
        ...newCampaignData,
        unitPrice: Number(newCampaignData.unitPrice),
        targetQuantity: Number(newCampaignData.targetQuantity),
        minCommitmentQty: Number(newCampaignData.minCommitmentQty || 1),
        maxCommitmentQty: Number(newCampaignData.maxCommitmentQty),
      });
      if (res.success) {
        alert('Group-buying campaign created and launched!');
        setShowNewCampaignModal(false);
        setNewCampaignData({
          productId: '',
          pickupHubId: '',
          title: '',
          description: '',
          unitPrice: 0,
          targetQuantity: 30,
          minCommitmentQty: 1,
          maxCommitmentQty: 5,
          deadline: '',
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Campaign launch failed');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imagesArray = newProductData.images
        .split(',')
        .map((img) => img.trim())
        .filter(Boolean);

      const res = await ApiClient.post<any>('/products', {
        title: newProductData.title,
        description: newProductData.description,
        category: newProductData.category,
        unit: newProductData.unit,
        images: imagesArray.length > 0 ? imagesArray : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
      });

      if (res.success) {
        alert('New product added to your wholesale catalog!');
        setShowNewProductModal(false);
        setNewProductData({
          title: '',
          description: '',
          category: 'Grains & Rice',
          unit: 'kg',
          images: '',
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add product');
    }
  };

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.post<any>('/admin/hubs', newHubData);
      if (res.success) {
        alert('New Designated Community Pickup Hub created!');
        setShowNewHubModal(false);
        setNewHubData({
          name: '',
          address: '',
          city: 'Dhaka',
          area: '',
          contactPhone: '',
        });
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create pickup hub');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Wallet Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {user.role} Account
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {user.fullName}
            </h1>
            <p className="text-xs text-slate-500">{user.email} • ID: {user.id.slice(0, 8)}</p>
          </div>

          {/* Virtual Wallet Ledger Balance Card */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Available Wallet Balance
              </span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ৳{wallet ? wallet.availableBalance.toLocaleString() : '0.00'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Reserved: ৳{wallet ? wallet.reservedBalance.toLocaleString() : '0.00'}
              </p>
            </div>

            <div className="pl-4 border-l border-slate-200 dark:border-slate-700">
              <button
                onClick={handleSimulateTopUp}
                disabled={topUpLoading}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                {topUpLoading ? 'Processing...' : `+ Top-Up ৳${topUpAmount.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>

        {/* Role Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {(user.role === 'CONSUMER' || user.role === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('commitments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'commitments'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              My Commitments & QR Passes ({commitments.length})
            </button>
          )}

          {(user.role === 'SUPPLIER' || user.role === 'ADMIN') && (
            <>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === 'campaigns'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Wholesale Campaigns ({supplierCampaigns.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === 'products'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Product Catalog ({products.length})
              </button>
            </>
          )}

          {user.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Admin Operations & Hubs
            </button>
          )}

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'wallet'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Wallet Ledger & Transactions
          </button>
        </div>

        {/* Tab 1: Consumer Commitments */}
        {activeTab === 'commitments' && (
          <div className="space-y-4">
            {commitments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {commitments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">
                            {comm.campaign.product.category}
                          </span>
                          <Link
                            href={`/campaigns/${comm.campaignId}`}
                            className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-emerald-600 transition"
                          >
                            {comm.campaign.title}
                          </Link>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          comm.status === 'COMMITTED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : comm.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {comm.status}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Committed Quantity:</span>
                          <strong className="text-slate-900 dark:text-white">
                            {comm.quantity} {comm.campaign.product.unit}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Amount:</span>
                          <strong className="text-emerald-600">
                            ৳{comm.totalAmount.toLocaleString()}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hub:</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                            {comm.campaign.pickupHub.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Campaign Status:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {comm.campaign.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      {/* QR Code Pass Button if locked/ready */}
                      {comm.order?.pickupToken ? (
                        <button
                          onClick={() => setSelectedQrOrder(comm.order)}
                          className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                        >
                          <QrCode className="w-4 h-4" />
                          View Pickup QR Pass ({comm.order.pickupToken.status})
                        </button>
                      ) : (
                        <div className="text-[11px] text-center text-slate-400 py-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                          {comm.campaign.status === 'OPEN'
                            ? `Pool is ${comm.campaign.progressPercent}% full. QR Token generates on lock.`
                            : 'Campaign processing...'}
                        </div>
                      )}

                      {/* Cancel Commitment Button if campaign is still OPEN */}
                      {comm.status === 'COMMITTED' && comm.campaign.status === 'OPEN' && (
                        <button
                          onClick={() => handleCancelCommitment(comm.id)}
                          className="w-full py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold border border-red-200 dark:border-red-900/40 transition flex items-center justify-center gap-1.5"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Cancel Commitment & Restore Balance
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-500">
                  You haven't joined any group-buying pools yet.
                </p>
                <button
                  onClick={() => router.push('/#pools')}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Browse Active Pools
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Supplier Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  My Wholesale Group-Buying Campaigns
                </h3>
                <p className="text-xs text-slate-500">Manage pool capacities, dispatches, and warehouse operations</p>
              </div>
              <button
                onClick={() => setShowNewCampaignModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                Launch New Campaign
              </button>
            </div>

            {supplierCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supplierCampaigns.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {c.status}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {c.committedQuantity}/{c.targetQuantity} {c.product.unit} ({c.progressPercent}%)
                        </span>
                      </div>

                      <Link
                        href={`/campaigns/${c.id}`}
                        className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-emerald-600 transition block"
                      >
                        {c.title}
                      </Link>

                      <p className="text-xs text-slate-500">
                        Wholesale Price: <strong>৳{c.unitPrice}</strong>/{c.product.unit}
                      </p>

                      <p className="text-xs text-slate-500">
                        Hub: {c.pickupHub.name} ({c.pickupHub.city})
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {/* Action 1: Dispatch action button */}
                      {c.status === 'LOCKED' && (
                        <button
                          onClick={() => handleDispatchCampaign(c.id)}
                          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Truck className="w-4 h-4" />
                          Mark Dispatched to Hub
                        </button>
                      )}

                      {/* Action 2: Arrived at hub action button */}
                      {c.status === 'DISPATCHED' && (
                        <button
                          onClick={() => handleArriveAtHub(c.id)}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Arrived at Hub
                        </button>
                      )}

                      <Link
                        href={`/campaigns/${c.id}`}
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Live Pool Page
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-500">
                  You haven't launched any wholesale campaigns yet.
                </p>
                <button
                  onClick={() => setShowNewCampaignModal(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Create Your First Pool
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Supplier Products Catalog */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Wholesale Product Catalog
                </h3>
                <p className="text-xs text-slate-500">List and manage commodities available for collective group-buying</p>
              </div>
              <button
                onClick={() => setShowNewProductModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}
                        alt={prod.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">
                        {prod.category} • Unit: {prod.unit}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {prod.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {prod.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setNewCampaignData((prev) => ({
                          ...prev,
                          productId: prod.id,
                          title: `Bulk ${prod.title} Wholesale Pool`,
                        }));
                        setShowNewCampaignModal(true);
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/20 transition flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Launch Pool for this Product
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-500">
                  No products in your catalog yet.
                </p>
                <button
                  onClick={() => setShowNewProductModal(true)}
                  className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Admin Operations & Hubs */}
        {activeTab === 'admin' && user.role === 'ADMIN' && (
          <div className="space-y-8">
            {/* System Overview Stats Cards */}
            {adminStats && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Platform System Metrics & Health
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {adminStats.totalUsers}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Campaigns</span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {adminStats.totalCampaigns}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Commitments</span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {adminStats.totalCommitments}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Orders Created</span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {adminStats.totalOrders}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Active Hubs</span>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {adminStats.totalHubs}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Volume Processed</span>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                      ৳{adminStats.totalVolumeProcessed.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Designated Pickup Hubs Management */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Designated Pickup Hubs Network
                  </h3>
                  <p className="text-xs text-slate-500">Authorized community distribution centers</p>
                </div>
                <button
                  onClick={() => setShowNewHubModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                >
                  <PlusCircle className="w-4 h-4" />
                  Register New Hub
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hubs.map((hub) => (
                  <div
                    key={hub.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {hub.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {hub.city}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{hub.address}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between text-slate-400">
                      <span>Area: <strong>{hub.area}</strong></span>
                      <span>Phone: <strong>{hub.contactPhone}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Wallet Ledger */}
        {activeTab === 'wallet' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Double-Entry Virtual Wallet Ledger
            </h3>

            {wallet?.ledgerEntries && wallet.ledgerEntries.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                      <th className="py-3 px-4">Transaction Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Balance After</th>
                      <th className="py-3 px-4">Notes & Reference</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {wallet.ledgerEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] ${
                              entry.type === 'TOP_UP' || entry.type === 'REFUND'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {entry.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          ৳{entry.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          ৳{entry.balanceAfter.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {entry.notes || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No ledger entries recorded yet.</p>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Launch New Campaign Modal */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowNewCampaignModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Supplier Wholesale Engine
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-4">
              Launch Group-Buying Pool
            </h3>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Product from Catalog *
                </label>
                <select
                  required
                  value={newCampaignData.productId}
                  onChange={(e) => {
                    const selProd = products.find((p) => p.id === e.target.value);
                    setNewCampaignData({
                      ...newCampaignData,
                      productId: e.target.value,
                      title: selProd ? `Bulk ${selProd.title} Wholesale Pool` : newCampaignData.title,
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Designated Pickup Hub *
                </label>
                <select
                  required
                  value={newCampaignData.pickupHubId}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, pickupHubId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Neighborhood Hub --</option>
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.area}, {h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={newCampaignData.title}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, title: e.target.value })}
                  placeholder="e.g. Bulk Dinajpur Rice Pool (Save 30%)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCampaignData.description}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, description: e.target.value })}
                  placeholder="Details about quality, direct farmer sourcing, dispatch schedule..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Wholesale Unit Price (৳) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCampaignData.unitPrice || ''}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, unitPrice: Number(e.target.value) })}
                    placeholder="e.g. 3200"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Volume Goal *
                  </label>
                  <input
                    type="number"
                    min="2"
                    required
                    value={newCampaignData.targetQuantity || ''}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, targetQuantity: Number(e.target.value) })}
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Max Qty per User *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newCampaignData.maxCommitmentQty || ''}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, maxCommitmentQty: Number(e.target.value) })}
                    placeholder="e.g. 5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newCampaignData.deadline}
                    onChange={(e) => setNewCampaignData({ ...newCampaignData, deadline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition mt-2"
              >
                Launch Wholesale Campaign
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Product Modal */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowNewProductModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Catalog Management
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-4">
              Add Wholesale Commodity Product
            </h3>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProductData.title}
                  onChange={(e) => setNewProductData({ ...newProductData, title: e.target.value })}
                  placeholder="e.g. Premium Miniket Rice (50kg Bulk Sack)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newProductData.category}
                    onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Grains & Rice">Grains & Rice</option>
                    <option value="Edible Oils">Edible Oils</option>
                    <option value="Dairy & Poultry">Dairy & Poultry</option>
                    <option value="Pulses & Spices">Pulses & Spices</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Measurement Unit *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductData.unit}
                    onChange={(e) => setNewProductData({ ...newProductData, unit: e.target.value })}
                    placeholder="e.g. sack, can, crate, kg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newProductData.description}
                  onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                  placeholder="Quality grade, source region, packaging information..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={newProductData.images}
                  onChange={(e) => setNewProductData({ ...newProductData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition mt-2"
              >
                Save Product to Catalog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Register New Pickup Hub Modal */}
      {showNewHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowNewHubModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Admin Network Setup
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-4">
              Register Community Pickup Hub
            </h3>

            <form onSubmit={handleCreateHub} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hub Name *
                </label>
                <input
                  type="text"
                  required
                  value={newHubData.name}
                  onChange={(e) => setNewHubData({ ...newHubData, name: e.target.value })}
                  placeholder="e.g. Dhanmondi Community Hub"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHubData.city}
                    onChange={(e) => setNewHubData({ ...newHubData, city: e.target.value })}
                    placeholder="e.g. Dhaka"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Area / Thana *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHubData.area}
                    onChange={(e) => setNewHubData({ ...newHubData, area: e.target.value })}
                    placeholder="e.g. Dhanmondi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Physical Address *
                </label>
                <input
                  type="text"
                  required
                  value={newHubData.address}
                  onChange={(e) => setNewHubData({ ...newHubData, address: e.target.value })}
                  placeholder="e.g. House #42, Road #27 (Old)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={newHubData.contactPhone}
                  onChange={(e) => setNewHubData({ ...newHubData, contactPhone: e.target.value })}
                  placeholder="+8801700000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition mt-2"
              >
                Register Hub
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: QR Code Pass Modal */}
      {selectedQrOrder && selectedQrOrder.pickupToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              onClick={() => setSelectedQrOrder(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Authorized Pickup Pass
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Order #{selectedQrOrder.id.slice(0, 8)}
            </h3>

            {/* QR Image */}
            <div className="my-5 p-4 bg-white rounded-2xl shadow-inner inline-block border border-slate-200">
              <img
                src={selectedQrOrder.pickupToken.qrCodeDataUrl}
                alt="Pickup QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-4">
              <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider">
                {selectedQrOrder.pickupToken.tokenCode}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Status: {selectedQrOrder.pickupToken.status}
              </p>
            </div>

            <p className="text-[11px] text-slate-500">
              Show this QR code or token to the Hub Coordinator during product collection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
