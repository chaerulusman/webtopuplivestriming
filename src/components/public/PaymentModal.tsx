import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { QrisService } from '../../services/qris';
import { StorageService } from '../../services/storage';
import {
  Copy,
  Check,
  Clock,
  QrCode,
  Building2,
  AlertTriangle,
  Zap,
  RefreshCw,
  X,
  Share2,
} from 'lucide-react';

interface PaymentModalProps {
  transaction: Transaction;
  onClose: () => void;
  onPaymentSuccess: (updatedTx: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  transaction,
  onClose,
  onPaymentSuccess,
}) => {
  const [qrisDataUrl, setQrisDataUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes in seconds
  const [isProcessingSimulation, setIsProcessingSimulation] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<Transaction>(transaction);

  // Generate QRIS on mount if paymentMethod is qris
  useEffect(() => {
    if (transaction.paymentMethod === 'qris') {
      QrisService.generateQrisCode(transaction.id, transaction.totalAmount).then((res) => {
        setQrisDataUrl(res.dataUrl);
      });
    }
  }, [transaction]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll transaction status in case updated by admin or simulator
  useEffect(() => {
    const pollInterval = setInterval(() => {
      const fresh = StorageService.getTransactionById(transaction.id);
      if (fresh) {
        setCurrentTx(fresh);
        if (fresh.status === 'success') {
          clearInterval(pollInterval);
          onPaymentSuccess(fresh);
        }
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [transaction.id, onPaymentSuccess]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulate Payment Gateway Callback (Midtrans/Xendit/Doku QRIS)
  const handleSimulatePaymentGatewayCallback = () => {
    setIsProcessingSimulation(true);
    setTimeout(() => {
      try {
        const updated = StorageService.markAsPaid(
          transaction.id,
          transaction.paymentMethod === 'qris'
            ? 'Midtrans QRIS Webhook Callback (HTTP 200 Settlement)'
            : 'Sistem Robot Mutasi Bank (Auto Matching Kode Unik)'
        );
        setCurrentTx(updated);
        setIsProcessingSimulation(false);
        onPaymentSuccess(updated);
      } catch (err: unknown) {
        alert((err as Error).message || 'Gagal memproses callback pembayaran.');
        setIsProcessingSimulation(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30 mb-2 font-semibold">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Selesaikan Pembayaran Dalam: {formatTimer(timeLeft)}</span>
          </div>
          <h2 className="text-2xl font-black text-white">Instruksi Pembayaran</h2>
          <p className="text-xs text-slate-400">
            Nomor Pesanan: <span className="font-mono-code font-bold text-purple-400">{currentTx.id}</span>
          </p>
        </div>

        {/* Order Info Badge */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Aplikasi & Tujuan:</span>
            <span className="font-semibold text-white">
              {currentTx.appName} ({currentTx.userId}
              {currentTx.zoneId ? ` / ${currentTx.zoneId}` : ''})
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Item Pembelian:</span>
            <span className="font-semibold text-purple-300">{currentTx.packageName}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Notifikasi WhatsApp:</span>
            <span className="font-semibold text-emerald-400 font-mono-code">{currentTx.userWhatsapp}</span>
          </div>
          {currentTx.referralCode && (
            <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-900">
              <span className="text-amber-400">Kode Referral Mitra (4%):</span>
              <span className="font-bold text-amber-300 font-mono-code">
                {currentTx.referralCode} (+Rp {currentTx.referralCommission.toLocaleString('id-ID')})
              </span>
            </div>
          )}
        </div>

        {/* ===================== METODE QRIS ===================== */}
        {currentTx.paymentMethod === 'qris' && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-2xl text-slate-950 flex flex-col items-center justify-center shadow-lg border border-slate-300">
              {/* QRIS Header Banner */}
              <div className="w-full flex items-center justify-between border-b pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="bg-rose-600 text-white font-black text-xs px-2 py-0.5 rounded tracking-tighter">
                    QRIS
                  </span>
                  <span className="font-bold text-xs text-slate-800">QRIS NASIONAL</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  DOKU / MIDTRANS PG
                </span>
              </div>

              {/* QR Code Container */}
              <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-200">
                {qrisDataUrl ? (
                  <img
                    src={qrisDataUrl}
                    alt="QRIS StreamPay"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex flex-col items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs">Membuat QRIS Dinamis...</span>
                  </div>
                )}
              </div>

              {/* Merchant Details */}
              <div className="text-center mt-3">
                <p className="font-extrabold text-sm text-slate-900 tracking-tight">
                  STREAMPAY DIGITAL INDONESIA
                </p>
                <p className="text-[11px] text-slate-500 font-mono">NMID: ID1020304918231</p>
              </div>
            </div>

            {/* Total Bayar Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total Tagihan QRIS:</span>
                <div className="text-2xl font-black text-emerald-400 font-mono-code">
                  Rp {currentTx.totalAmount.toLocaleString('id-ID')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(currentTx.totalAmount.toString(), 'nominal')}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
              >
                {copiedField === 'nominal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-purple-950/30 border border-purple-800/40 p-3.5 rounded-xl text-xs text-purple-300 space-y-1">
              <p className="font-bold">📱 Cara Scan QRIS:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[11px]">
                <li>Buka aplikasi Bank (BCA Mobile, Livin, BRImo) atau E-Wallet (GoPay, DANA, OVO, ShopeePay).</li>
                <li>Pilih menu <strong>Scan / Bayar QRIS</strong> dan arahkan kamera ke barcode di atas.</li>
                <li>Periksa nama penerima <strong>STREAMPAY DIGITAL</strong> dan konfirmasi PIN Anda.</li>
                <li>Selesai! Koin akan langsung masuk ke akun dalam hitungan detik.</li>
              </ol>
            </div>
          </div>
        )}

        {/* ===================== METODE TRANSFER BANK DENGAN KODE UNIK ===================== */}
        {currentTx.paymentMethod === 'bank_transfer' && (
          <div className="space-y-4">
            {/* Rekening Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm text-white">
                    {currentTx.bankDetails?.bankName || 'Bank Transfer'}
                  </span>
                </div>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30">
                  REKENING UTAMA
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400">Nomor Rekening:</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl font-bold font-mono-code text-white tracking-wider">
                    {currentTx.bankDetails?.accountNumber || '8735019821'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(currentTx.bankDetails?.accountNumber || '8735019821', 'rekening')
                    }
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs rounded-lg border border-blue-500/30 transition-colors"
                  >
                    {copiedField === 'rekening' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Rekening</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Atas Nama: <strong className="text-slate-300">{currentTx.bankDetails?.accountHolder}</strong>
                </p>
              </div>
            </div>

            {/* NOMINAL TRANSFER DENGAN 3 DIGIT KODE UNIK */}
            <div className="bg-gradient-to-br from-amber-950/40 to-slate-950 p-5 rounded-2xl border-2 border-amber-500/60 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>TRANSFER JUMLAH TEPAT HINGGA 3 DIGIT TERAKHIR</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Yang Wajib Ditransfer:</span>
                  <div className="text-3xl font-black text-amber-300 font-mono-code tracking-tight">
                    Rp {currentTx.totalAmount.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Harga Koin: Rp {currentTx.basePrice.toLocaleString('id-ID')} +{' '}
                    <span className="text-amber-400 font-bold">
                      Kode Unik: Rp {currentTx.uniqueCode}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(currentTx.totalAmount.toString(), 'totalUnik')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {copiedField === 'totalUnik' ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      <span>Salin Nominal</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-amber-300/90 leading-relaxed">
                ⚠️ <strong>PENTING:</strong> 3 angka di belakang nominal (<span className="font-mono-code font-bold underline">Rp {currentTx.uniqueCode}</span>) adalah kode unik pesanan Anda. Sistem otomatis memvalidasi mutasi bank dalam 1-3 menit tanpa perlu upload bukti transfer!
              </p>
            </div>
          </div>
        )}

        {/* Live Simulator Callback Action Trigger */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Sistem Menunggu Pembayaran...
            </span>
            <span className="text-[11px] text-slate-500">Auto-check aktif</span>
          </div>

          {/* Test Simulator Button */}
          <button
            type="button"
            onClick={handleSimulatePaymentGatewayCallback}
            disabled={isProcessingSimulation}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isProcessingSimulation ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memproses Callback Gateway & Update DB...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span>
                  {currentTx.paymentMethod === 'qris'
                    ? '⚡ SIMULASI SCAN & BAYAR (TEST CALLBACK PG MIDTRANS)'
                    : '🏦 SIMULASI MUTASI BANK MASUK (TEST AUTO-MATCHING KODE UNIK)'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
