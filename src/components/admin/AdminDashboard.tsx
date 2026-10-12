import React, { useState } from 'react';
import { Transaction, LiveApp, AdminUser } from '../../types';
import { StorageService } from '../../services/storage';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Building2,
  QrCode,
  Tag,
  Phone,
  Eye,
  Check,
  RotateCw,
  UserCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  transactions: Transaction[];
  apps: LiveApp[];
  adminUsers?: AdminUser[];
  onRefreshData: () => void;
  onOpenWhatsAppSimulator: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  transactions,
  apps,
  adminUsers = [],
  onRefreshData,
  onOpenWhatsAppSimulator,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterApp, setFilterApp] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);
  const [adminActionMessage, setAdminActionMessage] = useState<string>('');
  const [activeAdminId, setActiveAdminId] = useState<string>(adminUsers[0]?.id || 'ADM-02');

  const activeOfficer = adminUsers.find((u) => u.id === activeAdminId) || adminUsers[0];

  const filteredTransactions = transactions.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterApp !== 'all' && t.appId !== filterApp) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = t.id.toLowerCase().includes(q);
      const matchUser = t.userId.toLowerCase().includes(q);
      const matchWa = t.userWhatsapp.includes(q);
      const matchRef = t.referralCode?.toLowerCase().includes(q);
      return matchId || matchUser || matchWa || matchRef;
    }
    return true;
  });

  const pendingCount = transactions.filter((t) => t.status === 'pending_payment').length;
  const successCount = transactions.filter((t) => t.status === 'success').length;
  const totalVolume = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const handleValidateSuccess = (id: string) => {
    try {
      const officerLabel = activeOfficer
        ? `${activeOfficer.name} (@${activeOfficer.username})`
        : 'Petugas Admin Mutasi Bank';
      StorageService.markAsPaid(id, `Validasi Manual oleh ${officerLabel}`);
      onRefreshData();
      setAdminActionMessage(`Transaksi ${id} BERHASIL divalidasi oleh ${officerLabel} & koin telah diinjeksi!`);
      setTimeout(() => setAdminActionMessage(''), 3500);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleMarkFailed = (id: string) => {
    if (confirm(`Yakin ingin membatalkan transaksi ${id}?`)) {
      try {
        StorageService.updateTransactionStatus(id, 'failed', 'Dibatalkan oleh Admin');
        onRefreshData();
        setAdminActionMessage(`Transaksi ${id} ditandai GAGAL/KEDALUWARSA.`);
        setTimeout(() => setAdminActionMessage(''), 3000);
      } catch (err: unknown) {
        alert((err as Error).message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Admin Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/30 mb-2 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>PORTAL PETUGAS OPERASIONAL ADMIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Validasi & Manajemen Transaksi
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoring mutasi transfer bank, pembayaran QRIS, & status injeksi koin live streaming
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {adminUsers.length > 0 && (
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-tight">Petugas Bertugas:</span>
                <select
                  value={activeAdminId}
                  onChange={(e) => setActiveAdminId(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {adminUsers.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                      {u.name} ({u.role === 'validator' ? 'Mutasi Bank' : u.role === 'supervisor' ? 'Supervisor' : 'CS'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            onClick={onRefreshData}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {adminActionMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 p-3.5 rounded-xl text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{adminActionMessage}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Menunggu Validasi / Bayar
          </span>
          <div className="text-3xl font-black text-amber-400 font-mono-code">
            {pendingCount} Pesanan
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cek kesesuaian 3 digit unik transfer bank
          </p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Transaksi Sukses
          </span>
          <div className="text-3xl font-black text-emerald-400 font-mono-code">
            {successCount} Pesanan
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Koin otomatis terkirim ke host</p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block mb-1">
            Total Omset Sukses
          </span>
          <div className="text-3xl font-black text-white font-mono-code">
            Rp {totalVolume.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Volume transaksi berhasil diproses</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID Pesanan, Akun ID, No WA, atau Kode Referral..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono-code"
            />
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 text-white text-xs rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending_payment">Menunggu Pembayaran</option>
            <option value="success">Sukses Terverifikasi</option>
            <option value="failed">Gagal / Dibatalkan</option>
          </select>

          {/* Filter App */}
          <select
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value)}
            className="bg-slate-950 text-white text-xs rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Aplikasi</option>
            {apps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Aplikasi & Akun</th>
                <th className="py-3 px-3">Paket</th>
                <th className="py-3 px-3">Metode Bayar</th>
                <th className="py-3 px-3">Total Bayar</th>
                <th className="py-3 px-3">Referral 4%</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    Tidak ada transaksi yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono-code font-bold text-blue-400">
                      {tx.id}
                      <span className="block text-[10px] text-slate-500 font-normal">
                        {new Date(tx.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{tx.appName}</div>
                      <div className="text-[11px] text-slate-400 font-mono-code">
                        ID: {tx.userId}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono-code">
                        WA: {tx.userWhatsapp}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-purple-300">{tx.packageName}</span>
                    </td>

                    <td className="py-3 px-3">
                      {tx.paymentMethod === 'qris' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                          <QrCode className="w-3 h-3" /> QRIS Otomatis
                        </span>
                      ) : (
                        <div className="text-[11px]">
                          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
                            <Building2 className="w-3 h-3" /> {tx.bankDetails?.bankName || 'Bank'}
                          </span>
                          <span className="block text-[10px] text-amber-400 mt-0.5">
                            Kode Unik: +{tx.uniqueCode}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono-code">
                      <div className="font-extrabold text-white">
                        Rp {tx.totalAmount.toLocaleString('id-ID')}
                      </div>
                      {tx.paymentMethod === 'bank_transfer' && (
                        <div className="text-[10px] text-slate-500">
                          (Rp {tx.basePrice.toLocaleString('id-ID')} + {tx.uniqueCode})
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {tx.referralCode ? (
                        <div className="text-[11px]">
                          <span className="text-amber-400 font-bold font-mono-code">
                            {tx.referralCode}
                          </span>
                          <span className="block text-[10px] text-emerald-400">
                            +Rp {tx.referralCommission.toLocaleString('id-ID')} (4%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {tx.status === 'success' && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> SUKSES
                        </span>
                      )}
                      {tx.status === 'pending_payment' && (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                          <Clock className="w-3.5 h-3.5" /> PENDING
                        </span>
                      )}
                      {tx.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" /> GAGAL
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTxForDetail(tx)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail Transaksi"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {tx.status === 'pending_payment' && (
                          <>
                            <button
                              onClick={() => handleValidateSuccess(tx.id)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Validasi & Acc Transaksi"
                            >
                              <Check className="w-3 h-3" />
                              <span>Validasi</span>
                            </button>
                            <button
                              onClick={() => handleMarkFailed(tx.id)}
                              className="p-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 rounded-lg transition-colors cursor-pointer"
                              title="Batalkan Transaksi"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Detail Transaksi & Audit Log */}
      {selectedTxForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-200">
            <h3 className="text-xl font-bold text-white mb-1">Detail Audit Transaksi</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono-code">
              {selectedTxForDetail.id} • Dibuat: {new Date(selectedTxForDetail.createdAt).toLocaleString('id-ID')}
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Aplikasi / Game:</span>
                <span className="font-semibold text-white">{selectedTxForDetail.appName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ID Akun Tujuan:</span>
                <span className="font-mono-code font-bold text-white">
                  {selectedTxForDetail.userId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor WhatsApp Pembeli:</span>
                <span className="font-mono-code font-bold text-emerald-400">
                  {selectedTxForDetail.userWhatsapp}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode Bayar:</span>
                <span className="font-semibold text-purple-300 uppercase">
                  {selectedTxForDetail.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nominal Pokok:</span>
                <span className="font-mono-code">
                  Rp {selectedTxForDetail.basePrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kode Unik 3 Digit:</span>
                <span className="font-mono-code text-amber-400 font-bold">
                  +{selectedTxForDetail.uniqueCode}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-900">
                <span className="text-slate-400 font-bold">Total Wajib Ditransfer:</span>
                <span className="text-sm font-black text-white font-mono-code">
                  Rp {selectedTxForDetail.totalAmount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Referral Info */}
            {selectedTxForDetail.referralCode && (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 mb-4 text-xs">
                <span className="font-bold text-amber-400 block mb-0.5">
                  Mitra Referral: {selectedTxForDetail.referralCode}
                </span>
                <span className="text-slate-300">
                  Komisi 4%: <strong>Rp {selectedTxForDetail.referralCommission.toLocaleString('id-ID')}</strong> (Telah dikreditkan otomatis saat lunas)
                </span>
              </div>
            )}

            {/* Gateway Verification Log */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs mb-5">
              <span className="font-semibold text-slate-400 block mb-1">Log Sistem / Gateway:</span>
              <p className="text-[11px] text-slate-300 font-mono-code">
                Status: {selectedTxForDetail.status}
              </p>
              {selectedTxForDetail.verifiedBy && (
                <p className="text-[11px] text-emerald-400 font-mono-code mt-0.5">
                  Verifikasi: {selectedTxForDetail.verifiedBy}
                </p>
              )}
              {selectedTxForDetail.whatsappLog && (
                <p className="text-[11px] text-slate-400 font-mono-code mt-0.5">
                  WhatsApp: {selectedTxForDetail.whatsappLog}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTxForDetail(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              {selectedTxForDetail.status === 'pending_payment' && (
                <button
                  type="button"
                  onClick={() => {
                    handleValidateSuccess(selectedTxForDetail.id);
                    setSelectedTxForDetail(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg"
                >
                  Acc & Validasi Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
