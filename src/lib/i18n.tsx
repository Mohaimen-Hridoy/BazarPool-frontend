'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

export const translations = {
  en: {
    // Nav
    brandSub: 'Community Wholesale',
    navPools: 'Active Campaigns',
    navHow: 'How It Works',
    navDashboard: 'Dashboard',
    navScanner: 'QR Pickup Scanner',
    navSignIn: 'Sign In',
    navRegister: 'Get Started',
    navWallet: 'Virtual Wallet',

    // Hero
    heroBadge: 'Community-Based Wholesale Group-Buying Platform',
    heroTitlePrefix: 'Buy Direct at Wholesale Prices by',
    heroTitleHighlight: 'Pooling Demand',
    heroDescription:
      'Individual households and student hostels often can’t meet massive wholesale minimum orders. BazarPool combines community demand so everyone unlocks farm & mill rates with zero middlemen.',
    exploreBtn: 'Explore Active Pools',
    howItWorksBtn: 'How BazarPool Works',
    statDiscount: 'Average Wholesale Discount',
    statRefund: 'Automated Expiry Refund',
    statQr: 'Hub Verification System',
    statLedger: 'Virtual Ledger Security',

    // Section 1
    poolsSubtitle: 'Live Opportunities',
    poolsTitle: 'Active Wholesale Pools',
    poolsHint: 'Commit individual quantities. When total target is reached, the pool locks and fulfills!',
    allLocations: 'All Locations',
    searchPlaceholder: 'Search commodities, pools, hubs...',
    allCategories: 'ALL',
    resetFilters: 'Reset Filters',
    noPoolsFound: 'No active group-buying pools match your filters.',

    // Card
    activePool: 'ACTIVE POOL',
    lockedPool: 'LOCKED (TARGET MET)',
    fulfillmentPool: 'FULFILLMENT / AT HUB',
    wholesaleUnitPrice: 'Wholesale Unit Price',
    poolProgress: 'Pool Progress',
    committed: 'Committed',
    left: 'left',
    goalAchieved: 'Goal Achieved!',
    commitNow: 'Commit Now',
    viewPoolDetails: 'View Pool Details',
    daysRemaining: 'days remaining',
    endingToday: 'Ending today',

    // Details Page
    backToPools: 'Wholesale Pools',
    directSource: 'Direct Mill / Farm Source',
    openForCommitments: 'OPEN FOR COMMITMENTS',
    targetMetLocked: 'TARGET MET & LOCKED',
    inFulfillment: 'IN FULFILLMENT / AT HUB',
    expiredRefunded: 'EXPIRED (100% REFUNDED)',
    pickupHubLabel: 'Pickup Hub',
    aboutOpportunity: 'About this Group-Buying Opportunity',
    commodityUnit: 'Commodity Unit',
    minCommitment: 'Min Commitment',
    maxPerMember: 'Max Per Member',
    timeLeft: 'Time Left',
    designatedHubTitle: 'Designated Neighborhood Pickup Hub',
    designatedHubSub: 'Pick up orders locally with zero home-delivery surcharges',
    verifiedSupplier: 'Verified Direct Wholesale Supplier',
    trustedPartner: 'Trusted Partner',
    collectiveWholesalePrice: 'Collective Wholesale Price',
    saveVsRetail: '⚡ Save 25%–35% compared to individual retail store purchases',
    joinPoolBtn: 'Join Pool & Commit Quantity',
    refundGuarantee: '100% Automated Refund if target is not met',
    atomicLedgerGuarantee: 'Atomic reservation in virtual double-entry wallet',
    securePassGuarantee: 'Secure QR Token pass generated upon locking',

    // Verifier
    verifierTitle: 'Hub Pickup QR Token Verifier',
    verifierSub: 'Authorize and verify consumer product handovers. Double redemptions are strictly blocked.',
    liveCamera: 'Live Camera QR Scanner',
    openCamera: 'Open Live Camera',
    turnOffCamera: 'Turn Off Camera',
    pointCamera: "Point camera at Consumer's QR Pickup Pass",
    enterToken: 'Enter or Paste Pickup Token Code',
    authorizeBtn: 'Authorize & Verify Pickup',
    validatingBtn: 'Validating Token & Checking Security...',

    // MFS / Wallet Top-Up
    topUpTitle: 'Recharge Virtual Wallet',
    topUpSub: 'Simulate instant deposit or test automated MFS payment webhook',
    mfsInstantMethod: 'Select Payment Method',
    payWithBkash: 'bKash Instant',
    payWithNagad: 'Nagad Direct',
    payWithCard: 'Debit / Credit Card',
    amountLabel: 'Recharge Amount (৳)',
    confirmRecharge: 'Complete Payment & Credit Wallet',

    // Dashboard & Commitments
    myCommitmentsTab: 'My Commitments & QR Passes',
    supplierCampaignsTab: 'Wholesale Campaigns',
    productsCatalogTab: 'Product Catalog',
    adminOpsTab: 'Admin Operations & Hubs',
    walletLedgerTab: 'Wallet Ledger & Transactions',
    availableWalletBalance: 'Available Wallet Balance',
    reservedBalance: 'Reserved Balance',
    topUpWalletBtn: 'Top-Up Wallet (MFS)',
    selectQuantity: 'Select Quantity',
    unitPriceLabel: 'Unit Wholesale Price',
    totalAmountLabel: 'Total Commitment Amount',
    insufficientBalance: 'Insufficient wallet balance',
    quickTopUp: 'Quick Top-Up',
    confirmCommitment: 'Confirm Commitment',
  },
  bn: {
    // Nav
    brandSub: 'কমিউনিটি পাইকারি বাজার',
    navPools: 'সক্রিয় ক্যাম্পেইনসমূহ',
    navHow: 'কীভাবে কাজ করে',
    navDashboard: 'ড্যাশবোর্ড',
    navScanner: 'কিউআর পিকআপ স্ক্যানার',
    navSignIn: 'লগইন',
    navRegister: 'অ্যাকাউন্ট খুলুন',
    navWallet: 'ভার্চুয়াল ওয়ালেট',

    // Hero
    heroBadge: 'কমিউনিটি-ভিত্তিক হোলসেল গ্রুপ-বায়িং প্ল্যাটফর্ম',
    heroTitlePrefix: 'চাহিদা একত্র করে সরাসরি পাইকারি দরে কিনুন',
    heroTitleHighlight: 'BazarPool-এ',
    heroDescription:
      'ব্যক্তিগত পরিবার বা ছাত্র মেসে এককভাবে বড় পাইকারি লট কেনা সম্ভব হয় না। BazarPool প্রতিবেশীদের চাহিদাকে একত্র করে যাতে প্রত্যেকে কোনো মধ্যস্বত্বভোগী ছাড়াই সরাসরি মিল ও খামারের দামে নিত্যপণ্য পান।',
    exploreBtn: 'চলতি পুলগুলো দেখুন',
    howItWorksBtn: 'পদ্ধতি জানুন',
    statDiscount: 'গড় পাইকারি সাশ্রয়',
    statRefund: '১০০% অটোমেটিক রিফান্ড',
    statQr: 'হাব কিউআর ভেরিফিকেশন',
    statLedger: 'ডাবল-এন্ট্রি ওয়ালেট নিরাপত্তা',

    // Section 1
    poolsSubtitle: 'লাইভ সুযোগ',
    poolsTitle: 'চলতি পাইকারি পুলসমূহ',
    poolsHint: 'আপনার প্রয়োজনীয় পরিমাণ কমিট করুন। টার্গেট পূরণ হলেই পুল লক হবে এবং হাবে সরবরাহ করা হবে!',
    allLocations: 'সকল এলাকা',
    searchPlaceholder: 'পণ্য, পুল বা হাবের নাম দিয়ে খুঁজুন...',
    allCategories: 'সকল ক্যাটাগরি',
    resetFilters: 'ফিল্টার রিসেট',
    noPoolsFound: 'আপনার ফিল্টারের সাথে কোনো সক্রিয় পুল পাওয়া যায়নি।',

    // Card
    activePool: 'সক্রিয় পুল',
    lockedPool: 'টার্গেট পূরণ (লকড)',
    fulfillmentPool: 'হাবে সরবরাহ চলছে',
    wholesaleUnitPrice: 'পাইকারি রেট',
    poolProgress: 'পুলের অগ্রগতি',
    committed: 'কমিট হয়েছে',
    left: 'বাকি',
    goalAchieved: 'টার্গেট সম্পন্ন!',
    commitNow: 'অংশ নিন',
    viewPoolDetails: 'বিস্তারিত দেখুন',
    daysRemaining: 'দিন বাকি',
    endingToday: 'আজই শেষ',

    // Details Page
    backToPools: 'পাইকারি পুলসমূহ',
    directSource: 'সরাসরি মিল / খামার থেকে',
    openForCommitments: 'অংশগ্রহণের জন্য উন্মুক্ত',
    targetMetLocked: 'টার্গেট পূরণ হয়েছে (লকড)',
    inFulfillment: 'সরবরাহ চলছে / হাবে রয়েছে',
    expiredRefunded: 'মেয়াদোত্তীর্ণ (১০০% রিফান্ডেড)',
    pickupHubLabel: 'পিকআপ হাব',
    aboutOpportunity: 'এই গ্রুপ-বায়িং পুল সম্পর্কে',
    commodityUnit: 'পরিমাপের একক',
    minCommitment: 'সর্বনিম্ন নেওয়া যাবে',
    maxPerMember: 'সর্বোচ্চ সীমা',
    timeLeft: 'সময় বাকি',
    designatedHubTitle: 'নির্ধারিত এলাকার পিকআপ হাব',
    designatedHubSub: 'হোম-ডেলিভারি চার্জ ছাড়াই নিজের সুবিধাজনক সময়ে হাব থেকে পণ্য বুঝে নিন',
    verifiedSupplier: 'যাচাইকৃত সরাসরি পাইকারি সরবরাহকারী',
    trustedPartner: 'বিশ্বস্ত পার্টনার',
    collectiveWholesalePrice: 'সম্মিলিত পাইকারি দর',
    saveVsRetail: '⚡ খুচরা দোকান বা বাজারের চেয়ে ২৫%–৩৫% পর্যন্ত সাশ্রয়',
    joinPoolBtn: 'পুলে অংশ নিন ও পরিমাণ নির্ধারণ করুন',
    refundGuarantee: 'টার্গেট পূরণ না হলে ১০০% টাকা স্বয়ংক্রিয় রিফান্ড',
    atomicLedgerGuarantee: 'ভার্চুয়াল ডাবল-এন্ট্রি ওয়ালেটে নিরাপদ তহবিল সংরক্ষণ',
    securePassGuarantee: 'পুল লক হলে নিরাপদ কিউআর টোকেন পাস প্রদান',

    // Verifier
    verifierTitle: 'হাব পিকআপ কিউআর টোকেন ভেরিফায়ার',
    verifierSub: 'গ্রাহকের পণ্য হস্তান্তর যাচাই ও অনুমোদন করুন। ডাবল রিডেম্পশন স্বয়ংক্রিয়ভাবে ব্লক করা হবে।',
    liveCamera: 'লাইভ ক্যামেরা কিউআর স্ক্যানার',
    openCamera: 'ক্যামেরা চালু করুন',
    turnOffCamera: 'ক্যামেরা বন্ধ করুন',
    pointCamera: 'গ্রাহকের কিউআর পাসের দিকে ক্যামেরা তাক করুন',
    enterToken: 'পিকআপ টোকেন কোড লিখুন বা পেস্ট করুন',
    authorizeBtn: 'পণ্য হস্তান্তর অনুমোদন করুন',
    validatingBtn: 'টোকেন ও নিরাপত্তা যাচাই করা হচ্ছে...',

    // MFS / Wallet Top-Up
    topUpTitle: 'ভার্চুয়াল ওয়ালেট রিচার্জ',
    topUpSub: 'সরাসরি মোবাইল ব্যাংকিং বা টেস্ট এমএফএস পেমেন্টের মাধ্যমে ওয়ালেটে টাকা যোগ করুন',
    mfsInstantMethod: 'পেমেন্ট মাধ্যম বেছে নিন',
    payWithBkash: 'বিকাশ ইনস্ট্যান্ট',
    payWithNagad: 'নগদ ডিরেক্ট',
    payWithCard: 'ডেবিট / ক্রেডিট কার্ড',
    amountLabel: 'রিচার্জের পরিমাণ (৳)',
    confirmRecharge: 'পেমেন্ট সম্পন্ন করে ওয়ালেটে যোগ করুন',

    // Dashboard & Commitments
    myCommitmentsTab: 'আমার কমিটমেন্ট ও কিউআর পাস',
    supplierCampaignsTab: 'পাইকারি ক্যাম্পেইনসমূহ',
    productsCatalogTab: 'পণ্য ক্যাটালগ',
    adminOpsTab: 'অ্যাডমিন পরিচালনা ও হাব',
    walletLedgerTab: 'ওয়ালেট লেজার ও লেনদেন',
    availableWalletBalance: 'ব্যবহারযোগ্য ওয়ালেট ব্যালেন্স',
    reservedBalance: 'রিজার্ভ ব্যালেন্স',
    topUpWalletBtn: 'ওয়ালেট রিচার্জ (MFS)',
    selectQuantity: 'পরিমাণ নির্বাচন করুন',
    unitPriceLabel: 'পাইকারি একক মূল্য',
    totalAmountLabel: 'মোট কমিটমেন্টের পরিমাণ',
    insufficientBalance: 'ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই',
    quickTopUp: 'তাৎক্ষণিক রিচার্জ',
    confirmCommitment: 'কমিটমেন্ট নিশ্চিত করুন',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('bn'); // Default to Bangla for authentic local experience!

  useEffect(() => {
    const saved = localStorage.getItem('bazarpool_lang');
    if (saved === 'en' || saved === 'bn') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bazarpool_lang', lang);
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
