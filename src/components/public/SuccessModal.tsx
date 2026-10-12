import React, { useEffect } from 'react';
import { Transaction, SystemSettings } from '../../types';
import { WhatsAppService } from '../../services/whatsapp';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Sparkles,
  MessageSquare,
  Gift,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface SuccessModalProps {
  transaction: Transaction;
  settings: SystemSettings;
  onClose: () => void;
  onOpenWhatsAppSimulator: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  transaction,
  settings,
  onClose,
  onOpenWhatsAppSimulator,
}) => {
  useEffect(() => {
    // Fire festive confetti
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const waLink = WhatsAppService.getDirectWhatsAppLink(transaction, settings);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-200 text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4 text-emerald-400">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30 mb-2 font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TRANSAKSI SUKSES & SELESAI</span>
        </div>

        <h2 className="text-2xl font-black text-white">Injeksi Koin Berhasil!</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Pembayaran Anda telah diverifikasi oleh sistem dan koin telah masuk ke akun target Anda.
        </p>

        {/* Invoice Summary Box */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left my-6 space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-900">
            <span className="text-slate-400">Nomor Pesanan:</span>
            <span className="font-mono-code font-bold text-purple-400">{transaction.id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Aplikasi Streaming:</span>
            <span className="font-semibold text-white">{transaction.appName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">ID Akun Tujuan:</span>
            <span className="font-mono-code font-bold text-white">
              {transaction.userId}
              {transaction.zoneId ? ` (${transaction.zoneId})` : ''}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Item Pembelian:</span>
            <span className="font-bold text-emerald-400">{transaction.packageName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Metode Bayar:</span>
            <span className="font-semibold text-slate-300 uppercase">
              {transaction.paymentMethod === 'qris'
                ? 'QRIS Otomatis'
                : `Transfer Bank (${transaction.bankDetails?.bankName || 'Bank'})`}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-900">
            <span className="text-slate-400">Total Dibayar:</span>
            <span className="text-base font-extrabold text-white font-mono-code">
              Rp {transaction.totalAmount.toLocaleString('id-ID')}
            </span>
          </div>

          {transaction.verifiedBy && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Diverifikasi via: {transaction.verifiedBy}</span>
            </div>
          )}
        </div>

        {/* 4% Referral Bonus Banner if used */}
        {transaction.referralCode && transaction.referralCommission > 0 && (
          <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 mb-6 text-left flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">
                Bonus Referral 4% Berhasil Diberikan!
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pemilik kode referral <strong className="text-amber-400">{transaction.referralCode}</strong>{' '}
                mendapatkan komisi sebesar{' '}
                <strong className="text-white font-mono-code">
                  Rp {transaction.referralCommission.toLocaleString('id-ID')}
                </strong>{' '}
                langsung ke saldo mereka.
              </p>
            </div>
          </div>
        )}

        {/* WhatsApp Notification Direct Links */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onOpenWhatsAppSimulator}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Lihat Resi WhatsApp</span>
            </button>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Kirim ke WhatsApp Asli</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Kembali & Top-Up Lagi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
