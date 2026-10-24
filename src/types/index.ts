export type UserRole = 'CONSUMER' | 'SUPPLIER' | 'ADMIN' | 'HUB_COORDINATOR';

export type CampaignStatus =
  | 'OPEN'
  | 'LOCKED'
  | 'DISPATCHED'
  | 'AT_HUB'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REFUNDED';

export type CommitmentStatus = 'COMMITTED' | 'ALLOCATED' | 'CANCELLED' | 'REFUNDED';

export type OrderStatus =
  | 'PENDING_FULFILLMENT'
  | 'READY_FOR_PICKUP'
  | 'COLLECTED'
  | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface WalletAccount {
  id: string;
  userId: string;
  availableBalance: number;
  reservedBalance: number;
  ledgerEntries?: WalletLedgerEntry[];
}

export interface WalletLedgerEntry {
  id: string;
  type: 'TOP_UP' | 'RESERVATION' | 'RESERVATION_RELEASE' | 'PURCHASE_DEBIT' | 'REFUND';
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  supplierId: string;
  title: string;
  description: string;
  category: string;
  unit: string;
  images: string[];
}

export interface PickupHub {
  id: string;
  name: string;
  address: string;
  city: string;
  area: string;
  contactPhone: string;
}

export interface Campaign {
  id: string;
  supplierId: string;
  productId: string;
  pickupHubId: string;
  title: string;
  description?: string;
  unitPrice: number;
  targetQuantity: number;
  minCommitmentQty: number;
  maxCommitmentQty: number;
  committedQuantity: number;
  deadline: string;
  status: CampaignStatus;
  progressPercent: number;
  remainingQuantity: number;
  product: Product;
  pickupHub: PickupHub;
  supplier?: {
    id: string;
    fullName: string;
    email: string;
  };
  _count?: {
    commitments: number;
  };
}

export interface Commitment {
  id: string;
  campaignId: string;
  consumerId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: CommitmentStatus;
  createdAt: string;
  campaign: Campaign;
  order?: Order;
}

export interface Order {
  id: string;
  campaignId: string;
  consumerId: string;
  commitmentId: string;
  totalQuantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  pickupToken?: {
    id: string;
    tokenCode: string;
    qrCodeDataUrl: string;
    expiresAt: string;
    status: 'PENDING' | 'REDEEMED' | 'EXPIRED';
    redeemedAt?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  totalCommitments: number;
  totalOrders: number;
  totalHubs: number;
  totalVolumeProcessed: number;
  campaignsByStatus: {
    status: CampaignStatus;
    count: number;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: any[];
}
