import React, { useState } from 'react';
import { Transaction } from '../../types';
import { StorageService } from '../../services/storage';
import { Search, X, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface OrderLookupModalProps {
  onClose: () => void;
  onOpenPayment: (tx: Transaction) => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  onClose,
  onOpenPayment,
}) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Transaction[] | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const all = StorageService.getTransactions();
    const clean = query.trim().toUpperCase();
    const cleanNum = query.replace(/\D/g, '');

    const found = all.filter((t) => {
      const matchId = t.id.toUpperCase().includes(clean);
      const matchWa = cleanNum.length >= 4 && t.userWhatsapp.replace(/\D/g, '').includes(cleanNum);
      const matchUser = t.userId.toUpperCase().includes(clean);
      return matchId || matchWa || matchUser;
    });

    setResults(found);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Sukses Terkirim
          </span>
        );
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Menunggu Bayar
          </span>
        );
      case 'paid_verifying':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 text-xs px-2.5 py-0.5 rounded-full border border-blue-500/30 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Sedang Diverifikasi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 text-xs px-2.5 py-0.5 rounded-full border border-rose-500/30 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            Gagal / Kedaluwarsa
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3 text-purple-400">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white">Lacak Status Pesanan</h2>
          <p className="text-xs text-slate-400 mt-1">
            Masukkan Nomor Pesanan (contoh: <span className="font-mono-code text-purple-300">STP-88421</span>) atau nomor WhatsApp Anda.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ID Pesanan / Nomor WhatsApp..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono-code"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cari
          </button>
        </form>

        {results !== null && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {results.length === 0 ? (
              <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                Tidak ada pesanan ditemukan dengan kata kunci &quot;{query}&quot;.
              </div>
            ) : (
              results.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono-code">{tx.id}</span>
                    {getStatusBadge(tx.status)}
                  </div>

                  <div className="text-slate-400">
                    <p>
                      {tx.appName} • <strong className="text-white">{tx.packageName}</strong>
                    </p>
                    <p className="font-mono-code text-[11px] text-slate-500">
                      ID Akun: {tx.userId} | WA: {tx.userWhatsapp}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <span className="font-extrabold text-sm text-purple-300 font-mono-code">
                      Rp {tx.totalAmount.toLocaleString('id-ID')}
                    </span>

                    {tx.status === 'pending_payment' && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenPayment(tx);
                        }}
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        <span>Buka Pembayaran</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
