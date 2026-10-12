export type UserRole = 'public' | 'referral' | 'admin' | 'superadmin';

export interface LiveApp {
  id: string;
  name: string;
  category: string;
  currencyName: string;
  idFieldLabel: string;
  hasServerOrZone: boolean;
  serverOrZoneLabel?: string;
  placeholder: string;
  description: string;
  isActive: boolean;
  tag?: string;
  colorScheme: {
    from: string;
    to: string;
    accent: string;
    badge: string;
  };
  iconName: string;
}

export interface PackageItem {
  id: string;
  appId: string;
  amount: number;
  name: string;
  price: number;
  bonus?: number;
  discountPercent?: number;
  isPopular?: boolean;
}

export type PaymentMethodType = 'qris' | 'bank_transfer';

export interface BankInfo {
  id: string;
  bankCode: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI';
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  logoText: string;
  bgColor: string;
  isActive: boolean;
}

export type TransactionStatus =
  | 'pending_payment'
  | 'paid_verifying'
  | 'success'
  | 'failed'
  | 'expired';

export interface Transaction {
  id: string;
  createdAt: string;
  updatedAt: string;
  appId: string;
  appName: string;
  userId: string;
  zoneId?: string;
  userWhatsapp: string;
  packageId: string;
  packageName: string;
  packageAmount: number;
  currencyName: string;
  basePrice: number;
  uniqueCode: number;
  totalAmount: number;
  paymentMethod: PaymentMethodType;
  bankId?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  qrisPayload?: string;
  qrisExpiredAt?: string;
  status: TransactionStatus;
  referralCode?: string;
  referralCommission: number;
  paymentGatewayRef?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  whatsappSent: boolean;
  whatsappLog?: string;
}

export interface ReferralAccount {
  code: string;
  ownerName: string;
  ownerWhatsapp: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalTransactions: number;
  createdAt: string;
  status?: 'active' | 'suspended';
  customCommissionPercent?: number; // Custom % override (e.g. VIP streamer)
  bankAccount?: {
    bankOrEwallet: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: 'validator' | 'supervisor' | 'support';
  status: 'active' | 'suspended';
  totalValidated: number;
  lastActive: string;
  createdAt: string;
}

export interface ReferralWithdrawal {
  id: string;
  referralCode: string;
  amount: number;
  method: string;
  destinationAccount: string;
  destinationName: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface SystemSettings {
  referralCommissionPercent: number; // default 4%
  paymentGateway: {
    provider: 'Midtrans' | 'Xendit' | 'Doku';
    environment: 'sandbox' | 'production';
    merchantId: string;
    serverKey: string;
    clientKey: string;
    autoVerifyQRIS: boolean;
  };
  whatsappGateway: {
    provider: 'Fonnte' | 'Wablas' | 'Simulasi';
    apiKey: string;
    senderNumber: string;
    sendOnSuccess: boolean;
    templateMessage: string;
  };
  platformNotice: string;
  maintenanceMode: boolean;
}
