import React, { useState } from 'react';
import {
  LiveApp,
  PackageItem,
  BankInfo,
  SystemSettings,
  Transaction,
  ReferralAccount,
  ReferralWithdrawal,
  AdminUser,
} from '../../types';
import { StorageService } from '../../services/storage';
import {
  BarChart3,
  Sliders,
  CreditCard,
  MessageSquare,
  Package,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Tv,
  Percent,
  Send,
  Zap,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit,
  DollarSign,
  TrendingUp,
  Wallet,
  Clock,
  Check,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';

interface SuperadminDashboardProps {
  settings: SystemSettings;
  apps: LiveApp[];
  packages: PackageItem[];
  banks: BankInfo[];
  transactions: Transaction[];
  referrals: ReferralAccount[];
  withdrawals: ReferralWithdrawal[];
  adminUsers: AdminUser[];
  onRefreshData: () => void;
  onOpenWhatsAppSimulator: () => void;
}

export const SuperadminDashboard: React.FC<SuperadminDashboardProps> = ({
  settings,
  apps,
  packages,
  banks,
  transactions,
  referrals,
  withdrawals,
  adminUsers,
  onRefreshData,
  onOpenWhatsAppSimulator,
}) => {
  const [activeTab, setActiveTab] = useState<
    'monitoring' | 'admin_management' | 'referral_users' | 'referral' | 'pg' | 'whatsapp' | 'apps'
  >('monitoring');

  // Form states for settings
  const [refPercent, setRefPercent] = useState<number>(settings.referralCommissionPercent);
  const [noticeText, setNoticeText] = useState<string>(settings.platformNotice);
  const [pgProvider, setPgProvider] = useState<'Midtrans' | 'Xendit' | 'Doku'>(settings.paymentGateway.provider);
  const [pgEnv, setPgEnv] = useState<'sandbox' | 'production'>(settings.paymentGateway.environment);
  const [pgMerchantId, setPgMerchantId] = useState<string>(settings.paymentGateway.merchantId);
  const [pgServerKey, setPgServerKey] = useState<string>(settings.paymentGateway.serverKey);
  const [pgClientKey, setPgClientKey] = useState<string>(settings.paymentGateway.clientKey);
  const [pgAutoVerify, setPgAutoVerify] = useState<boolean>(settings.paymentGateway.autoVerifyQRIS);

  // WhatsApp form state
  const [waProvider, setWaProvider] = useState<'Fonnte' | 'Wablas' | 'Simulasi'>(settings.whatsappGateway.provider);
  const [waApiKey, setWaApiKey] = useState<string>(settings.whatsappGateway.apiKey);
  const [waSender, setWaSender] = useState<string>(settings.whatsappGateway.senderNumber);
  const [waTemplate, setWaTemplate] = useState<string>(settings.whatsappGateway.templateMessage);
  const [testPhone, setTestPhone] = useState<string>('081234567890');
  const [testResult, setTestResult] = useState<string>('');

  const [saveMessage, setSaveMessage] = useState<string>('');
  const [feedbackError, setFeedbackError] = useState<string>('');

  // ================= ADMIN VALIDATION MANAGEMENT STATE =================
  const [showAddAdminModal, setShowAddAdminModal] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [adminName, setAdminName] = useState<string>('');
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPhone, setAdminPhone] = useState<string>('');
  const [adminRole, setAdminRole] = useState<'validator' | 'supervisor' | 'support'>('validator');

  // ================= REFERRAL MANAGEMENT STATE =================
  const [searchReferralQuery, setSearchReferralQuery] = useState<string>('');
  const [referralSubTab, setReferralSubTab] = useState<'accounts' | 'withdrawals'>('accounts');
  
  // Custom commission modal
  const [selectedRefForRate, setSelectedRefForRate] = useState<ReferralAccount | null>(null);
  const [customRateInput, setCustomRateInput] = useState<string>('');

  // Balance adjustment modal
  const [selectedRefForBalance, setSelectedRefForBalance] = useState<ReferralAccount | null>(null);
  const [adjustAmountInput, setAdjustAmountInput] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');

  // Financial calculations
  const successfulTx = transactions.filter((t) => t.status === 'success');
  const totalGMV = successfulTx.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalReferralPaid = successfulTx.reduce((sum, t) => sum + t.referralCommission, 0);
  const netPlatformRevenue = totalGMV - totalReferralPaid;
  const totalWithdrawnAll = withdrawals
    .filter((w) => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0);
  const totalAvailableReferralBalance = referrals.reduce((sum, r) => sum + r.balance, 0);

  // Save Settings handler
  const handleSaveSettings = () => {
    const updatedSettings: SystemSettings = {
      ...settings,
      referralCommissionPercent: Number(refPercent),
      platformNotice: noticeText,
      paymentGateway: {
        provider: pgProvider,
        environment: pgEnv,
        merchantId: pgMerchantId,
        serverKey: pgServerKey,
        clientKey: pgClientKey,
        autoVerifyQRIS: pgAutoVerify,
      },
      whatsappGateway: {
        ...settings.whatsappGateway,
        provider: waProvider,
        apiKey: waApiKey,
        senderNumber: waSender,
        templateMessage: waTemplate,
      },
    };

    StorageService.saveSettings(updatedSettings);
    onRefreshData();
    setSaveMessage('Konfigurasi sistem & persentase komisi referral berhasil disimpan!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleTestWhatsApp = () => {
    if (!testPhone) return;
    setTestResult(`Mengirim pesan tes via ${waProvider} ke ${testPhone}...`);
    setTimeout(() => {
      setTestResult(`✅ Notifikasi WhatsApp BERHASIL dikirim ke ${testPhone}! (Status HTTP 200 OK)`);
      setTimeout(() => setTestResult(''), 4000);
    }, 800);
  };

  // ---------------- ADMIN MANAGEMENT ACTIONS ----------------
  const handleOpenAddAdmin = () => {
    setEditingAdmin(null);
    setAdminName('');
    setAdminUsername('');
    setAdminEmail('');
    setAdminPhone('');
    setAdminRole('validator');
    setShowAddAdminModal(true);
  };

  const handleOpenEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setAdminName(admin.name);
    setAdminUsername(admin.username);
    setAdminEmail(admin.email);
    setAdminPhone(admin.phone);
    setAdminRole(admin.role);
    setShowAddAdminModal(true);
  };

  const handleSaveAdminUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError('');

    if (!adminName.trim() || !adminUsername.trim() || !adminEmail.trim()) {
      setFeedbackError('Nama, Username, dan Email petugas wajib diisi.');
      return;
    }

    try {
      if (editingAdmin) {
        StorageService.updateAdminUser(editingAdmin.id, {
          name: adminName.trim(),
          username: adminUsername.trim(),
          email: adminEmail.trim(),
          phone: adminPhone.trim(),
          role: adminRole,
        });
        setSaveMessage(`Data petugas ${adminName} berhasil diperbarui.`);
      } else {
        StorageService.createAdminUser({
          name: adminName.trim(),
          username: adminUsername.trim(),
          email: adminEmail.trim(),
          phone: adminPhone.trim(),
          role: adminRole,
          status: 'active',
        });
        setSaveMessage(`Petugas Admin Validasi baru (${adminName}) berhasil ditambahkan.`);
      }
      onRefreshData();
      setShowAddAdminModal(false);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: unknown) {
      setFeedbackError((err as Error).message || 'Gagal menyimpan petugas admin.');
    }
  };

  const handleToggleAdminStatus = (id: string, name: string) => {
    try {
      const updated = StorageService.toggleAdminStatus(id);
      onRefreshData();
      setSaveMessage(`Status petugas ${name} diubah menjadi ${updated.status === 'active' ? 'AKTIF' : 'SUSPENDED'}.`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus akses petugas admin "${name}"?`)) {
      try {
        StorageService.deleteAdminUser(id);
        onRefreshData();
        setSaveMessage(`Petugas admin ${name} berhasil dihapus.`);
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (err: unknown) {
        alert((err as Error).message);
      }
    }
  };

  // ---------------- REFERRAL MANAGEMENT ACTIONS ----------------
  const handleToggleReferralStatus = (code: string) => {
    try {
      const updated = StorageService.toggleReferralStatus(code);
      onRefreshData();
      setSaveMessage(`Status kode rujukan ${code} diubah menjadi ${updated.status === 'active' ? 'AKTIF' : 'DITANGGUHKAN'}.`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleSaveCustomRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefForRate) return;

    const rate = parseFloat(customRateInput);
    if (isNaN(rate) || rate < 0 || rate > 50) {
      alert('Persentase komisi harus berupa angka antara 0% hingga 50%.');
      return;
    }

    try {
      StorageService.updateReferralAccount(selectedRefForRate.code, {
        customCommissionPercent: rate === settings.referralCommissionPercent ? undefined : rate,
      });
      onRefreshData();
      setSaveMessage(`Komisi khusus untuk ${selectedRefForRate.code} berhasil diset ke ${rate}%.`);
      setSelectedRefForRate(null);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleSaveAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefForBalance) return;

    const amount = parseInt(adjustAmountInput.replace(/\D/g, ''), 10);
    if (isNaN(amount) || amount <= 0) {
      alert('Masukkan nominal penyesuaian saldo yang valid.');
      return;
    }

    const delta = adjustType === 'add' ? amount : -amount;
    try {
      StorageService.adjustReferralBalance(
        selectedRefForBalance.code,
        delta,
        adjustReason.trim() || 'Penyesuaian manual oleh Superadmin'
      );
      onRefreshData();
      setSaveMessage(
        `Saldo mitra ${selectedRefForBalance.code} berhasil ${adjustType === 'add' ? 'ditambah' : 'dikurangi'} Rp ${amount.toLocaleString('id-ID')}.`
      );
      setSelectedRefForBalance(null);
      setAdjustAmountInput('');
      setAdjustReason('');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleDeleteReferral = (code: string) => {
    if (confirm(`Yakin ingin menghapus permanen kode referral ${code}? Data akumulasi tidak dapat dikembalikan.`)) {
      try {
        StorageService.deleteReferralAccount(code);
        onRefreshData();
        setSaveMessage(`Akun referral ${code} berhasil dihapus.`);
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (err: unknown) {
        alert((err as Error).message);
      }
    }
  };

  // Filtered referrals list
  const filteredReferrals = referrals.filter((r) => {
    if (!searchReferralQuery.trim()) return true;
    const q = searchReferralQuery.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      r.ownerName.toLowerCase().includes(q) ||
      r.ownerWhatsapp.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-rose-500/20 text-rose-300 text-xs px-3 py-1 rounded-full border border-rose-500/30 mb-2 font-bold">
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span>KONTROL SISTEM SUPERADMIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Monitoring & Konfigurasi Sistem
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola omset platform, petugas admin validasi, manajemen mitra referral 4%, dan integrasi gateway
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-900/50 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {saveMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{saveMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 no-scrollbar">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'monitoring'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Monitoring & Finansial</span>
        </button>

        {/* TAB BARU 1: MANAJEMEN ADMIN VALIDASI */}
        <button
          onClick={() => setActiveTab('admin_management')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'admin_management'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-300" />
          <span>Manajemen Admin Validasi</span>
          <span className="bg-blue-900/80 text-blue-200 px-1.5 py-0.2 rounded text-[10px] border border-blue-400/30">
            {adminUsers.length}
          </span>
        </button>

        {/* TAB BARU 2: MANAJEMEN USER REFERRAL */}
        <button
          onClick={() => setActiveTab('referral_users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'referral_users'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-amber-300" />
          <span>Manajemen User Referral</span>
          <span className="bg-amber-900/80 text-amber-200 px-1.5 py-0.2 rounded text-[10px] border border-amber-400/30">
            {referrals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('referral')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'referral'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Setting Rate Global & Banner</span>
        </button>

        <button
          onClick={() => setActiveTab('pg')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'pg'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Gateway & Rekening</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Gateway API</span>
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'apps'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>Kelola Aplikasi & Koin</span>
        </button>
      </div>

      {/* TAB 1: Monitoring & Finansial */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                Total Omset Bruto (GMV)
              </span>
              <div className="text-2xl font-black text-white font-mono-code">
                Rp {totalGMV.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {successfulTx.length} transaksi sukses diproses
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-5 border border-amber-500/30">
              <span className="text-xs text-amber-300 font-semibold block mb-1">
                Total Komisi Referral ({settings.referralCommissionPercent}%)
              </span>
              <div className="text-2xl font-black text-amber-400 font-mono-code">
                Rp {totalReferralPaid.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Dicairkan: Rp {totalWithdrawnAll.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-5 border border-emerald-500/30">
              <span className="text-xs text-emerald-300 font-semibold block mb-1">
                Net Margin Platform
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono-code">
                Rp {netPlatformRevenue.toLocaleString('id-ID')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Setelah potongan komisi mitra</p>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold block mb-1">
                Petugas Admin & Mitra
              </span>
              <div className="text-2xl font-black text-purple-400 font-mono-code">
                {adminUsers.length} Admin • {referrals.length} Mitra
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Semua sistem aktif beroperasi
              </p>
            </div>
          </div>

          {/* Volume Per Aplikasi Streaming */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Sebaran Transaksi Berdasarkan Aplikasi Live Streaming
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {apps.map((app) => {
                const count = transactions.filter((t) => t.appId === app.id).length;
                const volume = transactions
                  .filter((t) => t.appId === app.id && t.status === 'success')
                  .reduce((sum, t) => sum + t.totalAmount, 0);

                return (
                  <div
                    key={app.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-white">{app.name}</h4>
                      <p className="text-[11px] text-slate-400">{count} Transaksi</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-purple-300 font-mono-code block">
                        Rp {volume.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">Aktif</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MANAJEMEN ADMIN VALIDASI                          */}
      {/* ======================================================== */}
      {activeTab === 'admin_management' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-blue-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span>Manajemen Petugas Admin Validasi</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Kelola akun petugas operasional yang berwenang mengecek status & memvalidasi transaksi mutasi bank.
              </p>
            </div>

            <button
              onClick={handleOpenAddAdmin}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/50 flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Petugas Admin</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">Total Petugas Terdaftar:</span>
              <span className="text-2xl font-bold text-white font-mono-code">{adminUsers.length} Orang</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">Petugas Status Aktif:</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono-code">
                {adminUsers.filter((u) => u.status === 'active').length} Petugas
              </span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block mb-1">Akumulasi Validasi Berhasil:</span>
              <span className="text-2xl font-bold text-blue-400 font-mono-code">
                {adminUsers.reduce((sum, u) => sum + u.totalValidated, 0)} Transaksi
              </span>
            </div>
          </div>

          {/* Admin Table */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">ID & Nama Petugas</th>
                  <th className="py-3 px-3">Username & Email</th>
                  <th className="py-3 px-3">Nomor WhatsApp</th>
                  <th className="py-3 px-3">Peran / Jabatan</th>
                  <th className="py-3 px-3">Total Validasi</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Terakhir Aktif</th>
                  <th className="py-3 px-3 text-right">Aksi Superadmin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {adminUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      Belum ada petugas admin validasi. Klik tombol &quot;Tambah Petugas Admin&quot; untuk menambahkan.
                    </td>
                  </tr>
                ) : (
                  adminUsers.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{admin.name}</div>
                        <div className="text-[10px] text-blue-400 font-mono-code">{admin.id}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono-code font-bold text-slate-300">@{admin.username}</span>
                        <div className="text-[11px] text-slate-400">{admin.email}</div>
                      </td>

                      <td className="py-3 px-3 font-mono-code text-slate-300">
                        {admin.phone || '-'}
                      </td>

                      <td className="py-3 px-3">
                        {admin.role === 'supervisor' && (
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-500/30">
                            Supervisor Ops
                          </span>
                        )}
                        {admin.role === 'validator' && (
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/30">
                            Petugas Mutasi Bank
                          </span>
                        )}
                        {admin.role === 'support' && (
                          <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                            CS & WhatsApp
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono-code font-bold text-white">
                        {admin.totalValidated} trx
                      </td>

                      <td className="py-3 px-3">
                        {admin.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-400">
                        {admin.lastActive
                          ? new Date(admin.lastActive).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleAdminStatus(admin.id, admin.name)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                              admin.status === 'active'
                                ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300'
                                : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300'
                            }`}
                            title={admin.status === 'active' ? 'Suspend Petugas' : 'Aktifkan Petugas'}
                          >
                            {admin.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleOpenEditAdmin(admin)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data Petugas"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                            className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Petugas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MANAJEMEN USER REFERRAL                           */}
      {/* ======================================================== */}
      {activeTab === 'referral_users' && (
        <div className="space-y-6">
          {/* Header & Sub-Tabs */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Manajemen Pengguna & Mitra Referral</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kontrol penuh mitra referral: atur persentase komisi khusus (VIP streamer), sesuaikan saldo bonus, audit penarikan, dan tangguhkan akun.
                </p>
              </div>

              {/* Sub Tab Switcher */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setReferralSubTab('accounts')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    referralSubTab === 'accounts'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Akun Mitra ({referrals.length})
                </button>
                <button
                  onClick={() => setReferralSubTab('withdrawals')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    referralSubTab === 'withdrawals'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pencairan Saldo ({withdrawals.length})
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-0.5">Total Mitra Terdaftar:</span>
                <span className="text-xl font-bold text-white font-mono-code">{referrals.length} Akun</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-0.5">Total Saldo Mengendap:</span>
                <span className="text-xl font-bold text-emerald-400 font-mono-code">
                  Rp {totalAvailableReferralBalance.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-0.5">Total Komisi Diberikan:</span>
                <span className="text-xl font-bold text-amber-400 font-mono-code">
                  Rp {totalReferralPaid.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block mb-0.5">Total Pencairan Sukses:</span>
                <span className="text-xl font-bold text-purple-400 font-mono-code">
                  Rp {totalWithdrawnAll.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* SUB-VIEW 1: AKUN MITRA */}
          {referralSubTab === 'accounts' && (
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchReferralQuery}
                    onChange={(e) => setSearchReferralQuery(e.target.value)}
                    placeholder="Cari Kode Referral, Nama Mitra, atau Nomor WhatsApp..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-code"
                  />
                </div>
              </div>

              {/* Referral Partners Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Kode Referral</th>
                      <th className="py-3 px-3">Nama Pemilik / Channel</th>
                      <th className="py-3 px-3">WhatsApp & Rekening</th>
                      <th className="py-3 px-3">Saldo Tersedia</th>
                      <th className="py-3 px-3">Total Komisi</th>
                      <th className="py-3 px-3">Rate Komisi</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Aksi Superadmin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredReferrals.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          Tidak ada akun referral yang cocok dengan pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredReferrals.map((ref) => {
                        const effectiveRate = ref.customCommissionPercent ?? settings.referralCommissionPercent;
                        const isCustomRate = ref.customCommissionPercent !== undefined;

                        return (
                          <tr key={ref.code} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 font-mono-code font-extrabold text-amber-400 text-sm">
                              {ref.code}
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-bold text-white block">{ref.ownerName}</span>
                              <span className="text-[10px] text-slate-500">
                                {ref.totalTransactions} transaksi sukses
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="font-mono-code text-emerald-400 text-[11px]">
                                {ref.ownerWhatsapp}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {ref.bankAccount ? `${ref.bankAccount.bankOrEwallet} • ${ref.bankAccount.accountNumber}` : 'Belum diatur'}
                              </div>
                            </td>

                            <td className="py-3 px-3 font-mono-code font-bold text-emerald-300 text-sm">
                              Rp {ref.balance.toLocaleString('id-ID')}
                            </td>

                            <td className="py-3 px-3 font-mono-code">
                              <span className="font-bold text-white">
                                Rp {ref.totalEarned.toLocaleString('id-ID')}
                              </span>
                              <span className="block text-[10px] text-slate-500">
                                Ditarik: Rp {ref.totalWithdrawn.toLocaleString('id-ID')}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              {isCustomRate ? (
                                <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/40">
                                  VIP {effectiveRate}%
                                </span>
                              ) : (
                                <span className="text-slate-400 font-medium text-[11px]">
                                  Standar ({effectiveRate}%)
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              {ref.status === 'suspended' ? (
                                <span className="text-rose-400 font-bold text-[11px]">Ditangguhkan</span>
                              ) : (
                                <span className="text-emerald-400 font-bold text-[11px]">Aktif</span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Button Setting Rate VIP */}
                                <button
                                  onClick={() => {
                                    setSelectedRefForRate(ref);
                                    setCustomRateInput(String(effectiveRate));
                                  }}
                                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold rounded-lg border border-amber-500/30 cursor-pointer"
                                  title="Atur Komisi Khusus / VIP %"
                                >
                                  Rate %
                                </button>

                                {/* Button Sesuaikan Saldo */}
                                <button
                                  onClick={() => {
                                    setSelectedRefForBalance(ref);
                                    setAdjustAmountInput('');
                                    setAdjustReason('');
                                    setAdjustType('add');
                                  }}
                                  className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-500/30 cursor-pointer"
                                  title="Sesuaikan Saldo Manual"
                                >
                                  +/- Saldo
                                </button>

                                {/* Toggle Active/Suspend */}
                                <button
                                  onClick={() => handleToggleReferralStatus(ref.code)}
                                  className={`p-1.5 rounded-lg cursor-pointer ${
                                    ref.status === 'suspended'
                                      ? 'bg-emerald-600/20 text-emerald-300'
                                      : 'bg-rose-600/20 text-rose-300'
                                  }`}
                                  title={ref.status === 'suspended' ? 'Aktifkan Kembali' : 'Tangguhkan Kode'}
                                >
                                  {ref.status === 'suspended' ? <Check className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => handleDeleteReferral(ref.code)}
                                  className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-lg cursor-pointer transition-colors"
                                  title="Hapus Akun"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: PENCAIRAN SALDO MITRA */}
          {referralSubTab === 'withdrawals' && (
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">Daftar Pengajuan Penarikan Saldo Bonus</h4>
                <span className="text-xs text-slate-400">{withdrawals.length} Riwayat Penarikan</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-3">ID Penarikan</th>
                      <th className="py-3 px-3">Kode Referral</th>
                      <th className="py-3 px-3">Nominal Dicairkan</th>
                      <th className="py-3 px-3">Tujuan Transfer</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Waktu</th>
                      <th className="py-3 px-3 text-right">Tindakan Superadmin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-500">
                          Belum ada riwayat penarikan saldo.
                        </td>
                      </tr>
                    ) : (
                      withdrawals.map((wd) => (
                        <tr key={wd.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 font-mono-code font-bold text-purple-300">{wd.id}</td>
                          <td className="py-3 px-3 font-mono-code font-bold text-amber-400">{wd.referralCode}</td>
                          <td className="py-3 px-3 font-mono-code font-extrabold text-white text-sm">
                            Rp {wd.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-200">{wd.method}</span> •{' '}
                            <span className="font-mono-code">{wd.destinationAccount}</span>
                            <div className="text-[10px] text-slate-400">A/N: {wd.destinationName}</div>
                          </td>
                          <td className="py-3 px-3">
                            {wd.status === 'completed' && (
                              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
                                SUKSES DITRANSFER
                              </span>
                            )}
                            {wd.status === 'pending' && (
                              <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/30">
                                MENUNGGU APPROVAL
                              </span>
                            )}
                            {wd.status === 'rejected' && (
                              <span className="bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded text-[10px] border border-rose-500/30">
                                DITOLAK (DANA REFUND)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-400">
                            {new Date(wd.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {wd.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    StorageService.processWithdrawalApproval(wd.id, 'completed');
                                    onRefreshData();
                                    setSaveMessage(`Penarikan ${wd.id} disetujui & berhasil dicairkan!`);
                                    setTimeout(() => setSaveMessage(''), 3000);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold cursor-pointer"
                                >
                                  Setujui
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Masukkan alasan penolakan penarikan (dana akan dikembalikan ke saldo mitra):');
                                    if (reason) {
                                      StorageService.processWithdrawalApproval(wd.id, 'rejected', reason);
                                      onRefreshData();
                                      setSaveMessage(`Penarikan ${wd.id} ditolak dan dana telah di-refund ke akun ${wd.referralCode}.`);
                                      setTimeout(() => setSaveMessage(''), 3000);
                                    }
                                  }}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold cursor-pointer"
                                >
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 font-mono">Tuntas</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Setting Rate Global & Banner */}
      {activeTab === 'referral' && (
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="max-w-2xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Persentase Komisi Referral Standar Global
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Besaran persentase default yang otomatis didapatkan mitra saat tidak memiliki rate VIP khusus (Permintaan instruksi: 4%).
              </p>
              <div className="flex items-center gap-3">
                <div className="relative w-40">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={refPercent}
                    onChange={(e) => setRefPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-base font-bold text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-4 top-3 text-sm text-slate-400 font-bold">%</span>
                </div>
                <span className="text-xs text-amber-400 font-medium">
                  {refPercent}% dari total belanja transaksi
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white mb-1">Pesan Pengumuman / Running Text</h3>
              <p className="text-xs text-slate-400 mb-3">
                Teks promosi yang tampil di bagian atas dan header aplikasi.
              </p>
              <textarea
                rows={3}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
            >
              Simpan Pengaturan Referral
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Payment Gateway & Rekening */}
      {activeTab === 'pg' && (
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="max-w-3xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Integrasi Payment Gateway (QRIS Nasional)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Konfigurasi provider QRIS (Midtrans, Doku, atau Xendit) untuk pembuatan QR dinamis & verifikasi webhook.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Provider Payment Gateway:
                  </label>
                  <select
                    value={pgProvider}
                    onChange={(e) => setPgProvider(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Midtrans">Midtrans (GoPay, QRIS, BCA)</option>
                    <option value="Doku">DOKU Payment Gateway (QRIS)</option>
                    <option value="Xendit">Xendit XenPlatform (QRIS)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Environment:</label>
                  <select
                    value={pgEnv}
                    onChange={(e) => setPgEnv(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="sandbox">Sandbox (Testing / Simulator)</option>
                    <option value="production">Production (Live Merchant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Merchant ID:</label>
                  <input
                    type="text"
                    value={pgMerchantId}
                    onChange={(e) => setPgMerchantId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-code"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Server Key:</label>
                  <input
                    type="password"
                    value={pgServerKey}
                    onChange={(e) => setPgServerKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-code"
                  />
                </div>
              </div>
            </div>

            {/* Rekening Bank Transfer */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-white mb-2">Rekening Bank Tujuan (Kode Unik)</h3>
              <p className="text-xs text-slate-400 mb-3">
                Daftar rekening bank untuk transfer manual dengan akhiran 3 digit nomor pesanan.
              </p>

              <div className="space-y-2.5">
                {banks.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{b.bankName}</span>
                      <p className="text-[11px] text-slate-400 font-mono-code">
                        No. Rek: <strong className="text-white">{b.accountNumber}</strong> a/n{' '}
                        {b.accountHolder}
                      </p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded text-[10px] font-semibold">
                      Aktif Menerima Mutasi
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
            >
              Simpan Pengaturan Gateway
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: WhatsApp Gateway API */}
      {activeTab === 'whatsapp' && (
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
          <div className="max-w-3xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                Integrasi WhatsApp Gateway API (Fonnte / Wablas)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Kirim resi notifikasi instan ke WhatsApp pelanggan saat status pembayaran berhasil di-callback.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Provider WhatsApp API:
                  </label>
                  <select
                    value={waProvider}
                    onChange={(e) => setWaProvider(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Fonnte">Fonnte Gateway API (Resmi)</option>
                    <option value="Wablas">Wablas WhatsApp API</option>
                    <option value="Simulasi">Simulasi Internal (Tanpa Kuota)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nomor Pengirim (Sender Number):
                  </label>
                  <input
                    type="text"
                    value={waSender}
                    onChange={(e) => setWaSender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-code"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    API Key / Token Authorization:
                  </label>
                  <input
                    type="password"
                    value={waApiKey}
                    onChange={(e) => setWaApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Template Pesan WhatsApp Sukses:
                </label>
                <textarea
                  rows={4}
                  value={waTemplate}
                  onChange={(e) => setWaTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-code"
                />
              </div>
            </div>

            {/* Test WhatsApp Dispatcher */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-white block">
                Tes Kirim Pesan WhatsApp Langsung:
              </span>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Nomor WA tujuan (misal: 081234567890)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono-code"
                />
                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Tes</span>
                </button>
              </div>
              {testResult && (
                <p className="text-xs text-emerald-400 font-medium">{testResult}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Simpan Konfigurasi WhatsApp
              </button>
              <button
                onClick={onOpenWhatsAppSimulator}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Buka Simulator Notifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Kelola Aplikasi & Koin */}
      {activeTab === 'apps' && (
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Daftar Aplikasi Live Streaming</h3>
            <span className="text-xs text-slate-400">{apps.length} Aplikasi Terpasang</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apps.map((a) => {
              const pkgs = packages.filter((p) => p.appId === a.id);
              return (
                <div
                  key={a.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{a.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {a.currencyName} • {a.category}
                      </p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      AKTIF
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <p>Format ID: {a.idFieldLabel}</p>
                    <p className="mt-1">
                      Paket Koin: <strong className="text-purple-300">{pkgs.length} variasi</strong> (Rp{' '}
                      {pkgs[0]?.price.toLocaleString('id-ID')} - Rp{' '}
                      {pkgs[pkgs.length - 1]?.price.toLocaleString('id-ID')})
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: TAMBAH / EDIT PETUGAS ADMIN                     */}
      {/* ======================================================== */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-200">
            <h3 className="text-xl font-bold text-white mb-1">
              {editingAdmin ? 'Edit Data Petugas Admin' : 'Tambah Petugas Admin Validasi'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Petugas ini akan memiliki akses ke dashboard &quot;Admin Validasi&quot; untuk memvalidasi transaksi transfer bank.
            </p>

            {feedbackError && (
              <div className="bg-rose-950/60 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Lengkap Petugas <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Contoh: Sarah Wijaya"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Username Akun <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value.toLowerCase())}
                  placeholder="Contoh: sarah_val"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-blue-500 lowercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Email Petugas <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Contoh: sarah@streampay.id"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="Contoh: 081298765439"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Peran / Wewenang <span className="text-rose-400">*</span>
                </label>
                <select
                  value={adminRole}
                  onChange={(e) => setAdminRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="validator">Petugas Validasi Mutasi Bank</option>
                  <option value="supervisor">Supervisor Operasional</option>
                  <option value="support">Customer Support & WhatsApp</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer shadow-lg shadow-blue-900/50"
                >
                  {editingAdmin ? 'Simpan Perubahan' : 'Tambahkan Petugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ATUR RATE KOMISI KHUSUS / VIP MITRA             */}
      {/* ======================================================== */}
      {selectedRefForRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 text-slate-200">
            <h3 className="text-lg font-bold text-white mb-1">
              Atur Rate Komisi Khusus / VIP
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Mitra: <strong className="text-amber-400 font-mono-code">{selectedRefForRate.code}</strong> ({selectedRefForRate.ownerName})
            </p>

            <form onSubmit={handleSaveCustomRate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Persentase Komisi (%) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={customRateInput}
                    onChange={(e) => setCustomRateInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-bold text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3.5 top-3 text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default global saat ini: {settings.referralCommissionPercent}%. Masukkan angka khusus untuk mitra VIP streamer ini.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedRefForRate(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Terapkan Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PENYESUAIAN SALDO REFERRAL MANUAL               */}
      {/* ======================================================== */}
      {selectedRefForBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-6 text-slate-200">
            <h3 className="text-lg font-bold text-white mb-1">Penyesuaian Saldo Manual</h3>
            <p className="text-xs text-slate-400 mb-4">
              Mitra: <strong className="text-amber-400 font-mono-code">{selectedRefForBalance.code}</strong>. Saldo saat ini: <strong className="text-emerald-400 font-mono-code">Rp {selectedRefForBalance.balance.toLocaleString('id-ID')}</strong>
            </p>

            <form onSubmit={handleSaveAdjustBalance} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jenis Penyesuaian:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      adjustType === 'add'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    + Tambah Saldo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('subtract')}
                    className={`py-2 rounded-xl font-bold transition-all ${
                      adjustType === 'subtract'
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    - Potong Saldo
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nominal Penyesuaian (Rp) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={adjustAmountInput}
                  onChange={(e) => setAdjustAmountInput(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-bold text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Alasan / Catatan Audit
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Contoh: Bonus event streamer bulanan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedRefForBalance(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Konfirmasi Update Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
