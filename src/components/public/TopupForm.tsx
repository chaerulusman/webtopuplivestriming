import React, { useState, useEffect } from 'react';
import {
  LiveApp,
  PackageItem,
  BankInfo,
  PaymentMethodType,
  Transaction,
  ReferralAccount,
} from '../../types';
import { StorageService } from '../../services/storage';
import { INITIAL_LIVE_APPS } from '../../data/mockData';
import {
  Flame,
  Tv,
  Sparkles,
  Radio,
  Users,
  Gamepad2,
  CheckCircle2,
  QrCode,
  Building2,
  Phone,
  Tag,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface TopupFormProps {
  apps: LiveApp[];
  packages: PackageItem[];
  banks: BankInfo[];
  referrals: ReferralAccount[];
  initialReferralCode?: string;
  onProceedToPayment: (tx: Transaction) => void;
}

export const TopupForm: React.FC<TopupFormProps> = ({
  apps,
  packages,
  banks,
  referrals,
  initialReferralCode,
  onProceedToPayment,
}) => {
  const safeApps = apps.length > 0 ? apps : INITIAL_LIVE_APPS;
  const fallbackApp = safeApps[0];

  // Form State
  const [selectedAppId, setSelectedAppId] = useState<string>(fallbackApp.id || 'tiktok-live');
  const [userId, setUserId] = useState<string>('');
  const [zoneId, setZoneId] = useState<string>('');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('qris');
  const [selectedBankId, setSelectedBankId] = useState<string>(banks[0]?.id || 'bank-bca');
  const [referralCode, setReferralCode] = useState<string>(initialReferralCode || '');
  const [userWhatsapp, setUserWhatsapp] = useState<string>('081234567890');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync selectedAppId if apps changes
  useEffect(() => {
    if (safeApps.length > 0 && !safeApps.some((a) => a.id === selectedAppId)) {
      setSelectedAppId(safeApps[0].id);
    }
  }, [safeApps, selectedAppId]);

  // Selected App details
  const selectedApp = safeApps.find((a) => a.id === selectedAppId) || fallbackApp;
  const appPackages = packages.filter((p) => p.appId === selectedAppId);

  // Set default package when app changes
  useEffect(() => {
    if (appPackages.length > 0 && !appPackages.some((p) => p.id === selectedPackageId)) {
      const popular = appPackages.find((p) => p.isPopular) || appPackages[0];
      setSelectedPackageId(popular.id);
    }
  }, [selectedAppId, packages]);

  // Update initial referral from props if changed
  useEffect(() => {
    if (initialReferralCode) {
      setReferralCode(initialReferralCode);
    }
  }, [initialReferralCode]);

  const selectedPackage = appPackages.find((p) => p.id === selectedPackageId);

  // Validate referral code in real-time
  const cleanRef = referralCode.trim().toUpperCase();
  const matchedReferral = referrals.find((r) => r.code === cleanRef);

  // Icon resolver
  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'Tv':
        return <Tv className="w-5 h-5 text-cyan-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'Radio':
        return <Radio className="w-5 h-5 text-emerald-400" />;
      case 'Users':
        return <Users className="w-5 h-5 text-amber-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-violet-400" />;
      default:
        return <Tv className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!userId.trim()) {
      newErrors.userId = `${selectedApp.idFieldLabel} wajib diisi.`;
    }
    if (selectedApp.hasServerOrZone && !zoneId.trim()) {
      newErrors.zoneId = `${selectedApp.serverOrZoneLabel || 'Server/Region'} wajib diisi.`;
    }
    if (!selectedPackage) {
      newErrors.package = 'Silakan pilih nominal koin/diamond.';
    }
    if (!userWhatsapp.trim() || userWhatsapp.length < 8) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi minimal 8 digit.';
    }
    if (paymentMethod === 'bank_transfer' && !selectedBankId) {
      newErrors.bank = 'Silakan pilih rekening bank tujuan.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // scroll to first error
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const createdTx = StorageService.createTransaction({
        app: selectedApp,
        pkg: selectedPackage!,
        userId: userId.trim(),
        zoneId: selectedApp.hasServerOrZone ? zoneId.trim() : undefined,
        userWhatsapp: userWhatsapp.trim(),
        paymentMethod,
        bankId: paymentMethod === 'bank_transfer' ? selectedBankId : undefined,
        referralCode: cleanRef || undefined,
      });

      onProceedToPayment(createdTx);
    } catch (err: unknown) {
      alert((err as Error).message || 'Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-8">
      {/* STEP 1: Pilih Aplikasi Live Stream */}
      <section className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center font-bold text-sm text-purple-300">
            1
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pilih Aplikasi Live Streaming</h3>
            <p className="text-xs text-slate-400">Pilih platform streaming tujuan top-up koin atau diamond</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {apps.map((app) => {
            const isSelected = app.id === selectedAppId;
            return (
              <button
                type="button"
                key={app.id}
                onClick={() => {
                  setSelectedAppId(app.id);
                  if (errors.userId) setErrors((prev) => ({ ...prev, userId: '' }));
                }}
                className={`relative p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-gradient-to-b from-purple-950/70 to-slate-900 border-purple-500 shadow-lg shadow-purple-950/50 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {app.tag && (
                  <span
                    className={`absolute -top-2 right-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shadow-sm ${app.colorScheme.badge}`}
                  >
                    {app.tag}
                  </span>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`p-2 rounded-lg bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform`}
                  >
                    {getAppIcon(app.iconName)}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-purple-400 ml-auto" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {app.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {app.currencyName}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* STEP 2: Input ID Akun & Region */}
      <section className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center font-bold text-sm text-purple-300">
            2
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Masukkan Identitas Akun</h3>
            <p className="text-xs text-slate-400">
              Koin akan langsung dikirimkan ke ID {selectedApp.name} ini secara instan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {selectedApp.idFieldLabel} <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (errors.userId) setErrors((prev) => ({ ...prev, userId: '' }));
              }}
              placeholder={selectedApp.placeholder}
              className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono-code transition-all ${
                errors.userId ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
              }`}
            />
            {errors.userId && (
              <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {errors.userId}
              </p>
            )}
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3 text-purple-400" />
              {selectedApp.description}
            </p>
          </div>

          {selectedApp.hasServerOrZone && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {selectedApp.serverOrZoneLabel || 'Server / Zone ID'} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={zoneId}
                onChange={(e) => {
                  setZoneId(e.target.value);
                  if (errors.zoneId) setErrors((prev) => ({ ...prev, zoneId: '' }));
                }}
                placeholder="Contoh: Global / SEA"
                className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono-code transition-all ${
                  errors.zoneId ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.zoneId && (
                <p className="text-rose-400 text-xs mt-1">{errors.zoneId}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* STEP 3: Pilih Nominal Paket */}
      <section className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center font-bold text-sm text-purple-300">
            3
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pilih Nominal {selectedApp.currencyName}</h3>
            <p className="text-xs text-slate-400">Pilih paket sesuai kebutuhan gift streamer Anda</p>
          </div>
        </div>

        {errors.package && (
          <p className="text-rose-400 text-xs mb-3 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            {errors.package}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5">
          {appPackages.map((pkg) => {
            const isSelected = pkg.id === selectedPackageId;
            return (
              <button
                type="button"
                key={pkg.id}
                onClick={() => {
                  setSelectedPackageId(pkg.id);
                  if (errors.package) setErrors((prev) => ({ ...prev, package: '' }));
                }}
                className={`p-4 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-900/60 to-indigo-950/60 border-purple-500 ring-1 ring-purple-500 shadow-lg shadow-purple-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {pkg.isPopular && (
                  <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                    🔥 POPULER
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-base text-white tracking-tight">
                      {pkg.name}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  {pkg.bonus && (
                    <span className="inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-emerald-500/30 mb-2">
                      +{pkg.bonus} Bonus Koin
                    </span>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-xs text-slate-400 block">Harga Resmi:</span>
                  <span className="font-extrabold text-sm text-purple-300 font-mono-code">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* STEP 4: Pilih Metode Pembayaran */}
      <section className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center font-bold text-sm text-purple-300">
            4
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pilih Metode Pembayaran</h3>
            <p className="text-xs text-slate-400">
              Pilih QRIS instan atau Transfer Bank dengan 3 digit unik pesanan
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Opsi 1: QRIS */}
          <div
            onClick={() => setPaymentMethod('qris')}
            className={`cursor-pointer p-4 rounded-xl border transition-all relative ${
              paymentMethod === 'qris'
                ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500 shadow-lg shadow-purple-950/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">QRIS Dinamis (Otomatis)</h4>
                  <p className="text-[11px] text-slate-400">Semua Bank & E-Wallet Nasional</p>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                PROSES 1 DETIK
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Scan barcode via BCA Mobile, Mandiri Livin, GoPay, OVO, DANA, ShopeePay, LinkAja. Bebas biaya admin & langsung diverifikasi oleh Payment Gateway.
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-500">
              <span className="font-bold text-slate-300">Dukungan:</span>
              <span>QRIS • GPN • GoPay • DANA • OVO • ShopeePay</span>
            </div>
          </div>

          {/* Opsi 2: Transfer Bank dengan Kode Unik */}
          <div
            onClick={() => setPaymentMethod('bank_transfer')}
            className={`cursor-pointer p-4 rounded-xl border transition-all relative ${
              paymentMethod === 'bank_transfer'
                ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500 shadow-lg shadow-purple-950/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Transfer Bank (Kode Unik Pesanan)</h4>
                  <p className="text-[11px] text-slate-400">BCA, Mandiri, BRI, BNI</p>
                </div>
              </div>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                AUTO-MATCH
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Nominal transfer akan disesuaikan dengan <strong>3 digit nomor pesanan di belakang nominal</strong> (misal Rp 100.000 + Rp 421 = Rp 100.421) agar sistem mutasi bank memverifikasi otomatis tanpa upload struk.
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-500">
              <span className="font-bold text-slate-300">Fitur:</span>
              <span>Deteksi nominal pesanan otomatis & validasi cepat</span>
            </div>
          </div>
        </div>

        {/* Jika memilih Transfer Bank, tampilkan pilihan Bank */}
        {paymentMethod === 'bank_transfer' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Pilih Rekening Bank Tujuan: <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {banks.map((b) => {
                const isBankSelected = b.id === selectedBankId;
                return (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setSelectedBankId(b.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isBankSelected
                        ? 'bg-blue-950/60 border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-white">{b.bankCode}</span>
                      {isBankSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{b.bankName}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* STEP 5: Referral & Kontak WhatsApp */}
      <section className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center font-bold text-sm text-purple-300">
            5
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Kode Referral & WhatsApp</h3>
            <p className="text-xs text-slate-400">
              Bonus komisi 4% untuk mitra streamer & resi notifikasi otomatis via WhatsApp
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Referral Code Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Kode Referral (Opsional)
              </span>
              <span className="text-[11px] text-amber-400/90 font-normal">Bonus 4% ke Mitra</span>
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Contoh: ANDRI88 atau STREAMERID"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono-code transition-all uppercase"
            />
            {cleanRef && (
              <div className="mt-1.5">
                {matchedReferral ? (
                  <p className="text-emerald-400 text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Kode Mitra Valid: <strong>{matchedReferral.ownerName}</strong> (Komisi 4% aktif)
                  </p>
                ) : (
                  <p className="text-amber-400/90 text-xs">
                    Kode belum terdaftar sebagai mitra aktif (tetap bisa melanjutkan).
                  </p>
                )}
              </div>
            )}
          </div>

          {/* WhatsApp Number Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Nomor WhatsApp Pembeli <span className="text-rose-400">*</span>
            </label>
            <input
              type="tel"
              value={userWhatsapp}
              onChange={(e) => {
                setUserWhatsapp(e.target.value);
                if (errors.whatsapp) setErrors((prev) => ({ ...prev, whatsapp: '' }));
              }}
              placeholder="Contoh: 081234567890"
              className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono-code transition-all ${
                errors.whatsapp ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-800'
              }`}
            />
            {errors.whatsapp && (
              <p className="text-rose-400 text-xs mt-1">{errors.whatsapp}</p>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Struk bukti transfer & status injeksi koin akan otomatis dikirimkan ke nomor ini.
            </p>
          </div>
        </div>
      </section>

      {/* Floating Checkout Bar & Order Summary */}
      <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-purple-500/40 shadow-2xl shadow-purple-950/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="hidden sm:block p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Total Pembayaran:</span>
              <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 font-medium">
                {paymentMethod === 'qris' ? 'QRIS Instan' : 'Transfer Kode Unik'}
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono-code flex items-baseline gap-1">
              Rp {selectedPackage ? selectedPackage.price.toLocaleString('id-ID') : 0}
              {paymentMethod === 'bank_transfer' && (
                <span className="text-xs text-amber-400 font-normal">
                  + 3 digit unik pesanan
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {selectedApp.name} • {selectedPackage ? selectedPackage.name : '-'}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-600/40 hover:shadow-purple-600/60 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>{isSubmitting ? 'Memproses...' : 'Lanjut ke Pembayaran'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  );
};
