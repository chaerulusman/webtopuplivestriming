import {
  LiveApp,
  PackageItem,
  BankInfo,
  ReferralAccount,
  ReferralWithdrawal,
  AdminUser,
  Transaction,
  SystemSettings,
  TransactionStatus,
} from '../types';
import {
  INITIAL_LIVE_APPS,
  INITIAL_PACKAGES,
  INITIAL_BANKS,
  INITIAL_REFERRALS,
  INITIAL_ADMIN_USERS,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTINGS,
} from '../data/mockData';

const KEYS = {
  APPS: 'streampay_apps',
  PACKAGES: 'streampay_packages',
  BANKS: 'streampay_banks',
  REFERRALS: 'streampay_referrals',
  TRANSACTIONS: 'streampay_transactions',
  WITHDRAWALS: 'streampay_withdrawals',
  SETTINGS: 'streampay_settings',
  ADMIN_USERS: 'streampay_admin_users',
};

// Initial withdrawal seed
const INITIAL_WITHDRAWALS: ReferralWithdrawal[] = [
  {
    id: 'WD-1001',
    referralCode: 'ANDRI88',
    amount: 210000,
    method: 'DANA',
    destinationAccount: '081298765432',
    destinationName: 'Andri Pratama',
    status: 'completed',
    createdAt: '2025-02-10T11:20:00Z',
    processedAt: '2025-02-10T11:22:15Z',
  },
  {
    id: 'WD-1002',
    referralCode: 'POPPOVIP',
    amount: 380000,
    method: 'GoPay',
    destinationAccount: '082155443322',
    destinationName: 'Siti Rahmawati',
    status: 'completed',
    createdAt: '2025-02-14T09:10:00Z',
    processedAt: '2025-02-14T09:12:00Z',
  },
];

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // Apps
  static getApps(): LiveApp[] {
    return this.getItem(KEYS.APPS, INITIAL_LIVE_APPS);
  }

  static saveApps(apps: LiveApp[]): void {
    this.setItem(KEYS.APPS, apps);
  }

  // Packages
  static getPackages(): PackageItem[] {
    return this.getItem(KEYS.PACKAGES, INITIAL_PACKAGES);
  }

  static savePackages(packages: PackageItem[]): void {
    this.setItem(KEYS.PACKAGES, packages);
  }

  // Banks
  static getBanks(): BankInfo[] {
    return this.getItem(KEYS.BANKS, INITIAL_BANKS);
  }

  static saveBanks(banks: BankInfo[]): void {
    this.setItem(KEYS.BANKS, banks);
  }

  // Settings
  static getSettings(): SystemSettings {
    return this.getItem(KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  static saveSettings(settings: SystemSettings): void {
    this.setItem(KEYS.SETTINGS, settings);
  }

  // Admin Users Management
  static getAdminUsers(): AdminUser[] {
    return this.getItem(KEYS.ADMIN_USERS, INITIAL_ADMIN_USERS);
  }

  static saveAdminUsers(users: AdminUser[]): void {
    this.setItem(KEYS.ADMIN_USERS, users);
  }

  static createAdminUser(
    user: Omit<AdminUser, 'id' | 'totalValidated' | 'lastActive' | 'createdAt'>
  ): AdminUser {
    const list = this.getAdminUsers();
    const cleanUsername = user.username.trim().toLowerCase();
    if (list.some((u) => u.username.toLowerCase() === cleanUsername)) {
      throw new Error(`Username "${cleanUsername}" sudah digunakan oleh petugas lain.`);
    }

    const newAdmin: AdminUser = {
      ...user,
      id: `ADM-${String(list.length + 1).padStart(2, '0')}`,
      username: cleanUsername,
      totalValidated: 0,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    list.push(newAdmin);
    this.saveAdminUsers(list);
    return newAdmin;
  }

  static updateAdminUser(id: string, updates: Partial<AdminUser>): AdminUser {
    const list = this.getAdminUsers();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Petugas admin tidak ditemukan.');

    list[index] = { ...list[index], ...updates };
    this.saveAdminUsers(list);
    return list[index];
  }

  static toggleAdminStatus(id: string): AdminUser {
    const list = this.getAdminUsers();
    const index = list.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('Petugas admin tidak ditemukan.');

    const newStatus = list[index].status === 'active' ? 'suspended' : 'active';
    list[index].status = newStatus;
    this.saveAdminUsers(list);
    return list[index];
  }

  static deleteAdminUser(id: string): void {
    const list = this.getAdminUsers();
    const filtered = list.filter((u) => u.id !== id);
    if (filtered.length === list.length) throw new Error('Petugas admin tidak ditemukan.');
    this.saveAdminUsers(filtered);
  }

  static recordAdminValidation(adminNameOrUsername: string): void {
    const list = this.getAdminUsers();
    const clean = adminNameOrUsername.toLowerCase();
    const admin = list.find(
      (u) =>
        u.name.toLowerCase().includes(clean) ||
        u.username.toLowerCase() === clean ||
        clean.includes(u.name.toLowerCase())
    );
    if (admin) {
      admin.totalValidated += 1;
      admin.lastActive = new Date().toISOString();
      this.saveAdminUsers(list);
    }
  }

  // Referral Users Management
  static getReferrals(): ReferralAccount[] {
    return this.getItem(KEYS.REFERRALS, INITIAL_REFERRALS);
  }

  static saveReferrals(referrals: ReferralAccount[]): void {
    this.setItem(KEYS.REFERRALS, referrals);
  }

  static getReferralByCode(code: string): ReferralAccount | undefined {
    const list = this.getReferrals();
    return list.find((r) => r.code.toUpperCase() === code.trim().toUpperCase());
  }

  static createReferral(
    account: Omit<
      ReferralAccount,
      'balance' | 'totalEarned' | 'totalWithdrawn' | 'totalTransactions' | 'createdAt'
    >
  ): ReferralAccount {
    const list = this.getReferrals();
    const cleanCode = account.code.trim().toUpperCase();
    if (list.some((r) => r.code === cleanCode)) {
      throw new Error(`Kode referral "${cleanCode}" sudah digunakan.`);
    }

    const newRef: ReferralAccount = {
      ...account,
      code: cleanCode,
      balance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      totalTransactions: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    list.unshift(newRef);
    this.saveReferrals(list);
    return newRef;
  }

  static updateReferralAccount(code: string, updates: Partial<ReferralAccount>): ReferralAccount {
    const list = this.getReferrals();
    const index = list.findIndex((r) => r.code.toUpperCase() === code.toUpperCase());
    if (index === -1) throw new Error('Akun referral tidak ditemukan.');

    list[index] = { ...list[index], ...updates };
    this.saveReferrals(list);
    return list[index];
  }

  static adjustReferralBalance(code: string, amountDelta: number, reason: string): ReferralAccount {
    const list = this.getReferrals();
    const index = list.findIndex((r) => r.code.toUpperCase() === code.toUpperCase());
    if (index === -1) throw new Error('Akun referral tidak ditemukan.');

    const target = list[index];
    const newBal = target.balance + amountDelta;
    if (newBal < 0) throw new Error('Saldo referral tidak boleh negatif.');

    target.balance = newBal;
    if (amountDelta > 0) {
      target.totalEarned += amountDelta;
    }
    this.saveReferrals(list);
    return target;
  }

  static toggleReferralStatus(code: string): ReferralAccount {
    const list = this.getReferrals();
    const index = list.findIndex((r) => r.code.toUpperCase() === code.toUpperCase());
    if (index === -1) throw new Error('Akun referral tidak ditemukan.');

    const current = list[index].status || 'active';
    list[index].status = current === 'active' ? 'suspended' : 'active';
    this.saveReferrals(list);
    return list[index];
  }

  static deleteReferralAccount(code: string): void {
    const list = this.getReferrals();
    const filtered = list.filter((r) => r.code.toUpperCase() !== code.toUpperCase());
    if (filtered.length === list.length) throw new Error('Akun referral tidak ditemukan.');
    this.saveReferrals(filtered);
  }

  // Withdrawals Management & Approvals
  static getWithdrawals(): ReferralWithdrawal[] {
    return this.getItem(KEYS.WITHDRAWALS, INITIAL_WITHDRAWALS);
  }

  static saveWithdrawals(withdrawals: ReferralWithdrawal[]): void {
    this.setItem(KEYS.WITHDRAWALS, withdrawals);
  }

  static requestWithdrawal(
    referralCode: string,
    amount: number,
    method: string,
    destinationAccount: string,
    destinationName: string
  ): ReferralWithdrawal {
    const referrals = this.getReferrals();
    const cleanCode = referralCode.trim().toUpperCase();
    const refIndex = referrals.findIndex((r) => r.code === cleanCode);

    if (refIndex === -1) {
      throw new Error('Akun referral tidak ditemukan.');
    }

    const account = referrals[refIndex];
    if (account.status === 'suspended') {
      throw new Error('Akun referral ini sedang ditangguhkan. Tidak dapat melakukan penarikan.');
    }

    if (account.balance < amount) {
      throw new Error(`Saldo tidak mencukupi. Saldo Anda: Rp ${account.balance.toLocaleString('id-ID')}`);
    }

    if (amount < 20000) {
      throw new Error('Minimal penarikan saldo bonus adalah Rp 20.000.');
    }

    // Deduct available balance
    account.balance -= amount;
    account.totalWithdrawn += amount;
    this.saveReferrals(referrals);

    // Create withdrawal record
    const withdrawals = this.getWithdrawals();
    const newWd: ReferralWithdrawal = {
      id: `WD-${Date.now().toString().slice(-5)}`,
      referralCode: cleanCode,
      amount,
      method,
      destinationAccount,
      destinationName,
      status: 'completed', // Auto-disbursed
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    withdrawals.unshift(newWd);
    this.saveWithdrawals(withdrawals);
    return newWd;
  }

  static processWithdrawalApproval(
    withdrawalId: string,
    status: 'completed' | 'rejected',
    reason?: string
  ): ReferralWithdrawal {
    const withdrawals = this.getWithdrawals();
    const wdIndex = withdrawals.findIndex((w) => w.id === withdrawalId);
    if (wdIndex === -1) throw new Error('Permintaan penarikan tidak ditemukan.');

    const wd = withdrawals[wdIndex];
    const prevStatus = wd.status;
    wd.status = status;
    wd.processedAt = new Date().toISOString();
    if (reason) wd.rejectionReason = reason;

    // If rejected, refund the balance back to the referral user!
    if (status === 'rejected' && prevStatus !== 'rejected') {
      const referrals = this.getReferrals();
      const rIndex = referrals.findIndex((r) => r.code === wd.referralCode);
      if (rIndex !== -1) {
        referrals[rIndex].balance += wd.amount;
        referrals[rIndex].totalWithdrawn = Math.max(0, referrals[rIndex].totalWithdrawn - wd.amount);
        this.saveReferrals(referrals);
      }
    }

    this.saveWithdrawals(withdrawals);
    return wd;
  }

  // Transactions
  static getTransactions(): Transaction[] {
    return this.getItem(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  }

  static saveTransactions(transactions: Transaction[]): void {
    this.setItem(KEYS.TRANSACTIONS, transactions);
  }

  static getTransactionById(id: string): Transaction | undefined {
    const txs = this.getTransactions();
    return txs.find((t) => t.id === id);
  }

  static createTransaction(params: {
    app: LiveApp;
    pkg: PackageItem;
    userId: string;
    zoneId?: string;
    userWhatsapp: string;
    paymentMethod: 'qris' | 'bank_transfer';
    bankId?: string;
    referralCode?: string;
  }): Transaction {
    const settings = this.getSettings();
    const txs = this.getTransactions();

    // Generate unique order ID
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 3 digits
    const orderNumber = 88430 + txs.length;
    const txId = `STP-${orderNumber}`;

    // 3-digit unique code based on the order
    const uniqueCode = randomSuffix;

    const basePrice = params.pkg.price;
    // Bank transfer uses unique 3-digit suffix for automated matching
    const totalAmount =
      params.paymentMethod === 'bank_transfer'
        ? basePrice + uniqueCode
        : basePrice;

    // Check referral
    let appliedRefCode: string | undefined;
    let commission = 0;
    if (params.referralCode && params.referralCode.trim()) {
      const cleanRef = params.referralCode.trim().toUpperCase();
      const existingRef = this.getReferralByCode(cleanRef);
      if (existingRef && existingRef.status !== 'suspended') {
        appliedRefCode = cleanRef;
        const percent = existingRef.customCommissionPercent ?? settings.referralCommissionPercent ?? 4;
        commission = Math.round((basePrice * percent) / 100);
      }
    }

    // Bank details if bank transfer
    let bankDetails;
    if (params.paymentMethod === 'bank_transfer' && params.bankId) {
      const banks = this.getBanks();
      const b = banks.find((item) => item.id === params.bankId);
      if (b) {
        bankDetails = {
          bankName: b.bankName,
          accountNumber: b.accountNumber,
          accountHolder: b.accountHolder,
        };
      }
    }

    // QRIS payload (EMVCo compliant simulated string)
    const qrisPayload =
      params.paymentMethod === 'qris'
        ? `00020101021226600014ID.LINKAJA.WWW011893600918002160012802150000000000000000303UMI51440014ID.DOKU.WWW0215${txId}520454115303360540${totalAmount}5802ID5925STREAMPAY DIGITAL ID6013JAKARTA SEL62240720${txId}6304`
        : undefined;

    const newTx: Transaction = {
      id: txId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appId: params.app.id,
      appName: params.app.name,
      userId: params.userId,
      zoneId: params.zoneId,
      userWhatsapp: params.userWhatsapp,
      packageId: params.pkg.id,
      packageName: params.pkg.name,
      packageAmount: params.pkg.amount,
      currencyName: params.app.currencyName,
      basePrice,
      uniqueCode,
      totalAmount,
      paymentMethod: params.paymentMethod,
      bankId: params.bankId,
      bankDetails,
      qrisPayload,
      qrisExpiredAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: 'pending_payment',
      referralCode: appliedRefCode,
      referralCommission: commission,
      whatsappSent: false,
    };

    txs.unshift(newTx);
    this.saveTransactions(txs);
    return newTx;
  }

  static markAsPaid(
    transactionId: string,
    source: string = 'Payment Gateway Callback (Midtrans/Xendit/Doku QRIS)'
  ): Transaction {
    const txs = this.getTransactions();
    const index = txs.findIndex((t) => t.id === transactionId);

    if (index === -1) {
      throw new Error('Transaksi tidak ditemukan.');
    }

    const tx = txs[index];
    if (tx.status === 'success') {
      return tx; // Already processed
    }

    tx.status = 'success';
    tx.updatedAt = new Date().toISOString();
    tx.verifiedAt = new Date().toISOString();
    tx.verifiedBy = source;
    tx.paymentGatewayRef = `PG-${Date.now().toString().slice(-8)}`;

    // Add referral bonus if applicable and referral is active
    if (tx.referralCode && tx.referralCommission > 0) {
      const referrals = this.getReferrals();
      const rIndex = referrals.findIndex((r) => r.code === tx.referralCode);
      if (rIndex !== -1 && referrals[rIndex].status !== 'suspended') {
        referrals[rIndex].balance += tx.referralCommission;
        referrals[rIndex].totalEarned += tx.referralCommission;
        referrals[rIndex].totalTransactions += 1;
        this.saveReferrals(referrals);
      }
    }

    // Auto-credit validation stats to admin if validated manually
    if (source.includes('Admin') || source.includes('Petugas') || source.includes('Officer')) {
      this.recordAdminValidation(source);
    }

    // Auto-prepare WhatsApp notification log
    const settings = this.getSettings();
    if (settings.whatsappGateway.sendOnSuccess) {
      tx.whatsappSent = true;
      tx.whatsappLog = `Pesan WhatsApp otomatis terkirim via ${settings.whatsappGateway.provider} ke nomor ${tx.userWhatsapp}`;
    }

    this.saveTransactions(txs);
    return tx;
  }

  static updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    adminNote?: string
  ): Transaction {
    const txs = this.getTransactions();
    const index = txs.findIndex((t) => t.id === transactionId);
    if (index === -1) throw new Error('Transaksi tidak ditemukan.');

    const tx = txs[index];
    const prevStatus = tx.status;
    tx.status = status;
    tx.updatedAt = new Date().toISOString();

    if (status === 'success' && prevStatus !== 'success') {
      return this.markAsPaid(transactionId, adminNote || 'Validasi Manual Admin');
    }

    this.saveTransactions(txs);
    return tx;
  }

  static resetToDefault(): void {
    localStorage.removeItem(KEYS.APPS);
    localStorage.removeItem(KEYS.PACKAGES);
    localStorage.removeItem(KEYS.BANKS);
    localStorage.removeItem(KEYS.REFERRALS);
    localStorage.removeItem(KEYS.TRANSACTIONS);
    localStorage.removeItem(KEYS.WITHDRAWALS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.ADMIN_USERS);
  }
}
