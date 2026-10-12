/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  LiveApp,
  PackageItem,
  BankInfo,
  SystemSettings,
  Transaction,
  ReferralAccount,
  ReferralWithdrawal,
  AdminUser,
} from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { TopupForm } from './components/public/TopupForm';
import { PaymentModal } from './components/public/PaymentModal';
import { SuccessModal } from './components/public/SuccessModal';
import { OrderLookupModal } from './components/public/OrderLookupModal';
import { ReferralDashboard } from './components/referral/ReferralDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperadminDashboard } from './components/superadmin/SuperadminDashboard';
import { WhatsAppSimulatorModal } from './components/whatsapp/WhatsAppSimulatorModal';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Gift,
  CheckCircle,
  Flame,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function App() {
  // State
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [apps, setApps] = useState<LiveApp[]>(() => StorageService.getApps());
  const [packages, setPackages] = useState<PackageItem[]>(() => StorageService.getPackages());
  const [banks, setBanks] = useState<BankInfo[]>(() => StorageService.getBanks());
  const [referrals, setReferrals] = useState<ReferralAccount[]>(() => StorageService.getReferrals());
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());
  const [withdrawals, setWithdrawals] = useState<ReferralWithdrawal[]>(() => StorageService.getWithdrawals());
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => StorageService.getAdminUsers());
  const [settings, setSettings] = useState<SystemSettings>(() => StorageService.getSettings());

  // Active Modals & Overlays
  const [activePaymentTx, setActivePaymentTx] = useState<Transaction | null>(null);
  const [activeSuccessTx, setActiveSuccessTx] = useState<Transaction | null>(null);
  const [showOrderLookup, setShowOrderLookup] = useState<boolean>(false);
  const [showWhatsAppSimulator, setShowWhatsAppSimulator] = useState<boolean>(false);
  const [lastCompletedTx, setLastCompletedTx] = useState<Transaction | undefined>(undefined);
  const [initialReferralCode, setInitialReferralCode] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load / refresh data from StorageService
  const refreshAllData = useCallback(() => {
    setApps(StorageService.getApps());
    setPackages(StorageService.getPackages());
    setBanks(StorageService.getBanks());
    setReferrals(StorageService.getReferrals());
    setTransactions(StorageService.getTransactions());
    setWithdrawals(StorageService.getWithdrawals());
    setAdminUsers(StorageService.getAdminUsers());
    setSettings(StorageService.getSettings());
  }, []);

  useEffect(() => {
    refreshAllData();

    // Check URL query parameters for ?ref=...
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    if (refParam) {
      const cleanRef = refParam.trim().toUpperCase();
      setInitialReferralCode(cleanRef);
      setToastMessage(`🎉 Tautan referral ${cleanRef} aktif! Komisi 4% akan dibagikan.`);
      setTimeout(() => setToastMessage(null), 5000);
    }
  }, [refreshAllData]);

  // Handle Payment Proceed (opens payment modal)
  const handleProceedToPayment = (tx: Transaction) => {
    refreshAllData();
    setActivePaymentTx(tx);
  };

  // Handle Payment Success
  const handlePaymentSuccess = (updatedTx: Transaction) => {
    refreshAllData();
    setActivePaymentTx(null);
    setLastCompletedTx(updatedTx);
    setActiveSuccessTx(updatedTx);
  };

  const pendingAdminCount = transactions.filter((t) => t.status === 'pending_payment').length;
  const currentReferralBalance = referrals[0]?.balance || 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-300 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar with role switcher */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenOrderLookup={() => setShowOrderLookup(true)}
        onOpenWhatsAppSimulator={() => setShowWhatsAppSimulator(true)}
        pendingAdminCount={pendingAdminCount}
        referralBalancePreview={currentReferralBalance}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: USER PUBLIK */}
        {currentRole === 'public' && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border border-purple-500/30 p-6 sm:p-10 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/40">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>PLATFORM RESMI TOP-UP LIVE STREAMING NO. 1 DI INDONESIA</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  Top-Up Koin & Diamond <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                    Proses 1 Detik Masuk Otomatis
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  Beli koin TikTok Live, Bigo Diamonds, Poppo Live, UpLive, dan MICO dengan harga termurah. Bayar instan via <strong>QRIS Semua Bank/E-Wallet</strong> atau <strong>Transfer Bank Kode Unik Otomatis</strong>, disertai resi WhatsApp real-time.
                </p>

                {/* Features Pill Row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Injeksi Koin Instan</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Garansi 100% Legal</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200">
                    <Gift className="w-4 h-4 text-purple-400" />
                    <span>Bonus Referral {settings.referralCommissionPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Live Stream App Banner Showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {apps.map((a) => (
                <div
                  key={a.id}
                  className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center gap-2 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                  <span className="font-bold text-white truncate">{a.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto shrink-0 font-mono">1s</span>
                </div>
              ))}
            </div>

            {/* Top-up Form Component */}
            <TopupForm
              apps={apps}
              packages={packages}
              banks={banks}
              referrals={referrals}
              initialReferralCode={initialReferralCode}
              onProceedToPayment={handleProceedToPayment}
            />
          </div>
        )}

        {/* VIEW 2: DASBOR REFERRAL */}
        {currentRole === 'referral' && (
          <ReferralDashboard
            referrals={referrals}
            withdrawals={withdrawals}
            transactions={transactions}
            settings={settings}
            onRefreshData={refreshAllData}
            onSelectReferralForTopup={(code) => {
              setInitialReferralCode(code);
              setCurrentRole('public');
              setToastMessage(`Kode referral ${code} telah disiapkan untuk transaksi Anda!`);
              setTimeout(() => setToastMessage(null), 3000);
            }}
          />
        )}

        {/* VIEW 3: ADMIN VALIDASI */}
        {currentRole === 'admin' && (
          <AdminDashboard
            transactions={transactions}
            apps={apps}
            adminUsers={adminUsers}
            onRefreshData={refreshAllData}
            onOpenWhatsAppSimulator={() => setShowWhatsAppSimulator(true)}
          />
        )}

        {/* VIEW 4: SUPERADMIN */}
        {currentRole === 'superadmin' && (
          <SuperadminDashboard
            settings={settings}
            apps={apps}
            packages={packages}
            banks={banks}
            transactions={transactions}
            referrals={referrals}
            withdrawals={withdrawals}
            adminUsers={adminUsers}
            onRefreshData={refreshAllData}
            onOpenWhatsAppSimulator={() => setShowWhatsAppSimulator(true)}
          />
        )}
      </main>

      {/* MODAL 1: Payment Modal (QRIS & Bank Transfer Kode Unik) */}
      {activePaymentTx && (
        <PaymentModal
          transaction={activePaymentTx}
          onClose={() => setActivePaymentTx(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* MODAL 2: Success Modal */}
      {activeSuccessTx && (
        <SuccessModal
          transaction={activeSuccessTx}
          settings={settings}
          onClose={() => setActiveSuccessTx(null)}
          onOpenWhatsAppSimulator={() => {
            setActiveSuccessTx(null);
            setShowWhatsAppSimulator(true);
          }}
        />
      )}

      {/* MODAL 3: Order Lookup Modal */}
      {showOrderLookup && (
        <OrderLookupModal
          onClose={() => setShowOrderLookup(false)}
          onOpenPayment={(tx) => {
            setShowOrderLookup(false);
            setActivePaymentTx(tx);
          }}
        />
      )}

      {/* MODAL 4: WhatsApp Simulator Modal */}
      {showWhatsAppSimulator && (
        <WhatsAppSimulatorModal
          lastTransaction={lastCompletedTx || transactions[0]}
          settings={settings}
          onClose={() => setShowWhatsAppSimulator(false)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
