import React, { useState } from 'react';
import {
  ReferralAccount,
  ReferralWithdrawal,
  Transaction,
  SystemSettings,
} from '../../types';
import { StorageService } from '../../services/storage';
import {
  Gift,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Copy,
  Check,
  Share2,
  PlusCircle,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  DollarSign,
  ArrowDownCircle,
} from 'lucide-react';

interface ReferralDashboardProps {
  referrals: ReferralAccount[];
  withdrawals: ReferralWithdrawal[];
  transactions: Transaction[];
  settings: SystemSettings;
  onRefreshData: () => void;
  onSelectReferralForTopup: (code: string) => void;
}

export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({
  referrals,
  withdrawals,
  transactions,
  settings,
  onRefreshData,
  onSelectReferralForTopup,
}) => {
  const [selectedCode, setSelectedCode] = useState<string>(
    referrals[0]?.code || 'ANDRI88'
  );
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // New referral registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newWhatsapp, setNewWhatsapp] = useState<string>('');
  const [newBankType, setNewBankType] = useState<string>('DANA');
  const [newBankAccount, setNewBankAccount] = useState<string>('');
  const [newAccountName, setNewAccountName] = useState<string>('');
  const [regError, setRegError] = useState<string>('');

  // Withdrawal modal / form state
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<string>('DANA');
  const [withdrawAccount, setWithdrawAccount] = useState<string>('');
  const [withdrawName, setWithdrawName] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState<string>('');

  const currentRef = referrals.find((r) => r.code === selectedCode) || referrals[0];

  // Transactions using this code
  const codeTransactions = transactions.filter(
    (t) => t.referralCode?.toUpperCase() === selectedCode.toUpperCase()
  );

  // Withdrawals for this code
  const codeWithdrawals = withdrawals.filter(
    (w) => w.referralCode.toUpperCase() === selectedCode.toUpperCase()
  );

  const referralUrl = `${window.location.origin}/?ref=${currentRef ? currentRef.code : 'BONUS'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!currentRef) return;
    navigator.clipboard.writeText(currentRef.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWA = () => {
    if (!currentRef) return;
    const text = `Mau top-up koin TikTok Live, Bigo, & Poppo dengan harga termurah, cepat, dan resmi? Buka link ini dan gunakan kode saya *${currentRef.code}*: ${referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Register New Referral
  const handleRegisterReferral = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!newCode.trim()) {
      setRegError('Kode referral wajib diisi.');
      return;
    }
    if (!newName.trim() || !newWhatsapp.trim()) {
      setRegError('Nama dan Nomor WhatsApp wajib diisi.');
      return;
    }

    try {
      const created = StorageService.createReferral({
        code: newCode.trim().toUpperCase(),
        ownerName: newName.trim(),
        ownerWhatsapp: newWhatsapp.trim(),
        bankAccount: {
          bankOrEwallet: newBankType,
          accountNumber: newBankAccount.trim(),
          accountName: newAccountName.trim() || newName.trim(),
        },
      });

      onRefreshData();
      setSelectedCode(created.code);
      setShowRegisterModal(false);
      setNewCode('');
      setNewName('');
      setNewWhatsapp('');
      setNewBankAccount('');
      setNewAccountName('');
    } catch (err: unknown) {
      setRegError((err as Error).message || 'Gagal mendaftar kode referral.');
    }
  };

  // Submit Automatic Withdrawal
  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawSuccess('');

    const amt = parseInt(withdrawAmount.replace(/\D/g, ''), 10);
    if (isNaN(amt) || amt < 20000) {
      setWithdrawError('Minimal penarikan saldo adalah Rp 20.000.');
      return;
    }

    if (!currentRef || currentRef.balance < amt) {
      setWithdrawError('Saldo Anda tidak mencukupi untuk penarikan ini.');
      return;
    }

    if (!withdrawAccount.trim() || !withdrawName.trim()) {
      setWithdrawError('Nomor akun dan nama penerima wajib diisi.');
      return;
    }

    try {
      StorageService.requestWithdrawal(
        currentRef.code,
        amt,
        withdrawMethod,
        withdrawAccount.trim(),
        withdrawName.trim()
      );

      onRefreshData();
      setWithdrawSuccess(
        `Penarikan Rp ${amt.toLocaleString('id-ID')} ke ${withdrawMethod} (${withdrawAccount}) BERHASIL diajukan & dicairkan otomatis!`
      );
      setWithdrawAmount('');
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawSuccess('');
      }, 2500);
    } catch (err: unknown) {
      setWithdrawError((err as Error).message || 'Gagal memproses penarikan.');
    }
  };

  if (!currentRef) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p>Belum ada data referral. Silakan daftarkan kode baru.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-slate-900 rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30 mb-3 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>KOMISI OTOMATIS {settings.referralCommissionPercent}% TIAP TRANSAKSI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dasbor Pelacakan Mitra Referral
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Dapatkan bonus pasif sebesar <strong>{settings.referralCommissionPercent}%</strong> dari total belanja setiap kali ada orang yang top-up menggunakan kode referral atau link unik Anda. Saldo dapat ditarik kapan saja ke rekening bank / e-wallet secara otomatis!
            </p>
          </div>

          {/* Partner Selector & Add New */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <label className="block text-[10px] text-slate-400 uppercase font-semibold px-2 mb-1">
                Pilih Akun Mitra:
              </label>
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="bg-slate-900 text-white font-bold text-xs rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {referrals.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.code} - {r.ownerName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Daftar Kode Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Tersedia (Siap Ditarik) */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 rounded-2xl p-5 border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-300">Saldo Siap Ditarik</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono-code mb-2">
            Rp {currentRef.balance.toLocaleString('id-ID')}
          </div>
          <button
            onClick={() => {
              if (currentRef.bankAccount) {
                setWithdrawMethod(currentRef.bankAccount.bankOrEwallet);
                setWithdrawAccount(currentRef.bankAccount.accountNumber);
                setWithdrawName(currentRef.bankAccount.accountName);
              }
              setShowWithdrawModal(true);
            }}
            disabled={currentRef.balance < 20000}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              currentRef.balance >= 20000
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Tarik Saldo Otomatis</span>
          </button>
        </div>

        {/* Card 2: Total Komisi Didapat */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Komisi Didapat</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono-code mb-1">
            Rp {currentRef.totalEarned.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500">
            Akumulasi 4% dari semua transaksi sukses
          </p>
        </div>

        {/* Card 3: Total Telah Ditarik */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Telah Ditarik</span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono-code mb-1">
            Rp {currentRef.totalWithdrawn.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500">
            Total transfer ke e-wallet / rekening Anda
          </p>
        </div>

        {/* Card 4: Total Transaksi Berhasil */}
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Transaksi Berhasil</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono-code mb-1">
            {currentRef.totalTransactions} Pesanan
          </div>
          <p className="text-[11px] text-slate-500">
            Menggunakan kode {currentRef.code}
          </p>
        </div>
      </div>

      {/* Referral Link & Share Box */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Link Referral & Kode Promosi Anda</span>
            </h3>
            <p className="text-xs text-slate-400">
              Bagikan link ini ke penonton live streaming atau bio media sosial Anda.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectReferralForTopup(currentRef.code)}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 underline"
            >
              Coba Beli Top-Up dengan Kode Ini
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Link box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">
                Tautan Khusus Mitra:
              </span>
              <span className="text-xs text-slate-300 font-mono-code truncate block">
                {referralUrl}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs rounded-lg border border-purple-500/40 transition-colors whitespace-nowrap"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
            </button>
          </div>

          {/* Code box */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">
                Kode Referral:
              </span>
              <span className="text-base font-extrabold text-amber-400 font-mono-code">
                {currentRef.code}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs rounded-lg border border-amber-500/40 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Tersalin' : 'Salin Kode'}</span>
              </button>
              <button
                onClick={handleShareWA}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share WA</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Transparent Transactions Tracking & Withdrawal History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transparent Transaction Tracking Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Pelacakan Transaksi Rujukan (Transparan)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Daftar pesanan pembeli yang menggunakan kode {currentRef.code}
              </p>
            </div>
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-0.5 rounded-full border border-purple-500/30 font-semibold">
              {codeTransactions.length} Transaksi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Aplikasi</th>
                  <th className="py-2.5 px-3">Nominal Belanja</th>
                  <th className="py-2.5 px-3">Komisi 4%</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {codeTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      Belum ada transaksi dengan kode ini. Bagikan link referral Anda untuk mulai mendapatkan komisi 4%!
                    </td>
                  </tr>
                ) : (
                  codeTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono-code font-bold text-purple-300">
                        {tx.id}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-white">{tx.appName}</td>
                      <td className="py-2.5 px-3 font-mono-code">
                        Rp {tx.basePrice.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 font-mono-code font-bold text-emerald-400">
                        +Rp {tx.referralCommission.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3">
                        {tx.status === 'success' ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Cair
                          </span>
                        ) : (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Withdrawal History (1 col) */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Riwayat Penarikan</span>
              </h3>
              <p className="text-xs text-slate-400">Pencairan saldo komisi bonus</p>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {codeWithdrawals.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Belum ada riwayat penarikan saldo.
              </div>
            ) : (
              codeWithdrawals.map((wd) => (
                <div
                  key={wd.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-code font-bold text-white">
                      Rp {wd.amount.toLocaleString('id-ID')}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      SUKSES DITRANSFER
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] flex justify-between">
                    <span>
                      {wd.method} • {wd.destinationAccount}
                    </span>
                    <span className="text-slate-500">
                      {new Date(wd.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">A/N: {wd.destinationName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Register New Referral Partner */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-200">
            <h3 className="text-xl font-bold text-white mb-1">Daftar Menjadi Mitra Referral</h3>
            <p className="text-xs text-slate-400 mb-5">
              Buat kode unik Anda dan dapatkan bonus 4% dari setiap transaksi.
            </p>

            {regError && (
              <div className="bg-rose-950/50 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterReferral} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Kode Referral Yang Diinginkan <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: STREAMER_KITA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Lengkap / Channel <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Bagas Gaming Official"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nomor WhatsApp Aktif <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={newWhatsapp}
                  onChange={(e) => setNewWhatsapp(e.target.value)}
                  placeholder="Contoh: 081298765432"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block font-semibold text-slate-300 mb-1">
                  Rekening / E-Wallet Pencairan Saldo:
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select
                    value={newBankType}
                    onChange={(e) => setNewBankType(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="DANA">DANA</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="ShopeePay">ShopeePay</option>
                    <option value="BCA">Bank BCA</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="BNI">Bank BNI</option>
                  </select>
                  <input
                    type="text"
                    value={newBankAccount}
                    onChange={(e) => setNewBankAccount(e.target.value)}
                    placeholder="No Rekening / No HP E-Wallet"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Automatic Bonus Balance Withdrawal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-200">
            <h3 className="text-xl font-bold text-white mb-1">Penarikan Saldo Bonus Otomatis</h3>
            <p className="text-xs text-slate-400 mb-4">
              Saldo tersedia: <strong className="text-emerald-400 font-mono-code">Rp {currentRef.balance.toLocaleString('id-ID')}</strong> (Min. Rp 20.000)
            </p>

            {withdrawError && (
              <div className="bg-rose-950/50 border border-rose-500/50 text-rose-300 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRequestWithdrawal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nominal Penarikan (Rp) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Minimal 20000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-base font-bold text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount('50000')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                  >
                    Rp 50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount('100000')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                  >
                    Rp 100.000
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(currentRef.balance.toString())}
                    className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded text-[11px] border border-emerald-500/30 font-bold"
                  >
                    Tarik Semua (Rp {currentRef.balance.toLocaleString('id-ID')})
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Metode Pencairan (Bank / E-Wallet) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="DANA">DANA</option>
                  <option value="GoPay">GoPay</option>
                  <option value="OVO">OVO</option>
                  <option value="ShopeePay">ShopeePay</option>
                  <option value="BCA">Bank BCA</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="BNI">Bank BNI</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nomor Rekening / Nomor E-Wallet <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  placeholder="Contoh: 081298765432"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white font-mono-code focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Lengkap Pemilik Rekening <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={withdrawName}
                  onChange={(e) => setWithdrawName(e.target.value)}
                  placeholder="Nama sesuai KTP / Akun E-Wallet"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold cursor-pointer shadow-lg"
                >
                  Tarik Saldo Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
