import React from 'react';
import { ShieldCheck, Zap, Headphones, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-white text-base">
                Stream<span className="text-purple-400">Pay</span> ID
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform top-up resmi diamond & koin live streaming dengan auto-inject hitungan detik, metode QRIS dinamis, dan transfer bank kode unik presisi.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Sistem Aktif & Terverifikasi 24 Jam
            </div>
          </div>

          {/* Supported Apps */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Aplikasi Live Stream
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-purple-400 transition-colors">TikTok Live Coins</li>
              <li className="hover:text-purple-400 transition-colors">Bigo Live Diamonds</li>
              <li className="hover:text-purple-400 transition-colors">Poppo Live Coins</li>
              <li className="hover:text-purple-400 transition-colors">UpLive Diamonds</li>
              <li className="hover:text-purple-400 transition-colors">MICO Live Coins</li>
              <li className="hover:text-purple-400 transition-colors">Nimo TV Gems</li>
            </ul>
          </div>

          {/* Payment Channels */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Metode Pembayaran Resmi
            </h4>
            <div className="space-y-2 text-xs">
              <p className="text-slate-300 font-medium">QRIS Nasional (Semua Bank & E-Wallet):</p>
              <p className="text-slate-500">GoPay, OVO, DANA, ShopeePay, LinkAja, BCA Mobile</p>
              <p className="text-slate-300 font-medium mt-2">Transfer Bank Kode Unik:</p>
              <p className="text-slate-500">BCA, Mandiri, BRI, BNI (Otomatis deteksi nominal unik pesanan)</p>
            </div>
          </div>

          {/* Guarantees */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Keamanan & Dukungan
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Enkripsi SSL 256-bit Standar Perbankan</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Garansi 100% Koin Masuk atau Uang Kembali</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Headphones className="w-4 h-4 text-amber-400" />
                <span>Notifikasi Otomatis WhatsApp Real-Time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} StreamPay ID. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Syarat & Ketentuan</span>
            <span className="hover:text-white transition-colors cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-white transition-colors cursor-pointer">Panduan Affiliate 4%</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
