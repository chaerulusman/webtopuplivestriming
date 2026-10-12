import React from 'react';
import {
  UserRole,
} from '../../types';
import {
  Zap,
  ShoppingBag,
  Gift,
  ShieldCheck,
  Settings,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenOrderLookup: () => void;
  onOpenWhatsAppSimulator: () => void;
  pendingAdminCount: number;
  referralBalancePreview: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenOrderLookup,
  onOpenWhatsAppSimulator,
  pendingAdminCount,
  referralBalancePreview,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* Top promotional announcement */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-xs py-1.5 px-4 text-center text-slate-300 flex items-center justify-center gap-2 border-b border-violet-800/40">
        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-amber-500/30">
          <Sparkles className="w-3 h-3 text-amber-400" />
          BONUS REFERRAL 4%
        </span>
        <span>Ajak teman top-up live streaming, dapatkan komisi 4% dari setiap transaksi cair otomatis!</span>
        <button
          onClick={() => onRoleChange('referral')}
          className="text-amber-300 underline font-medium hover:text-amber-200 transition-colors ml-1"
        >
          Lihat Dasbor
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onRoleChange('public')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400 fill-purple-400/30" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-purple-300 transition-colors">
                    Stream<span className="text-purple-400">Pay</span>
                  </span>
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30">
                    ID
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-none">Top-Up Live Stream Resmi</p>
              </div>
            </button>
          </div>

          {/* Role Navigation Switcher Tabs */}
          <nav className="hidden md:flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onRoleChange('public')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'public'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              User Publik
            </button>

            <button
              onClick={() => onRoleChange('referral')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                currentRole === 'referral'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Dasbor Referral (4%)</span>
              {referralBalancePreview > 0 && (
                <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded text-[10px] border border-emerald-500/40">
                  Rp {(referralBalancePreview / 1000).toFixed(0)}k
                </span>
              )}
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                currentRole === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Validasi</span>
              {pendingAdminCount > 0 && (
                <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingAdminCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onRoleChange('superadmin')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === 'superadmin'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Superadmin
            </button>
          </nav>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenOrderLookup}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded-lg text-xs font-medium border border-slate-800 transition-colors"
              title="Cek Status Transaksi"
            >
              <Search className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Cek Pesanan</span>
            </button>

            <button
              onClick={onOpenWhatsAppSimulator}
              className="flex items-center gap-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 px-3 py-2 rounded-lg text-xs font-medium border border-emerald-800/50 transition-colors"
              title="Simulator Pesan WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Notif WA</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 no-scrollbar border-t border-slate-900">
          <button
            onClick={() => onRoleChange('public')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentRole === 'public' ? 'bg-purple-600 text-white' : 'text-slate-400'
            }`}
          >
            🛒 User Publik
          </button>
          <button
            onClick={() => onRoleChange('referral')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentRole === 'referral' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            🎁 Referral 4%
          </button>
          <button
            onClick={() => onRoleChange('admin')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentRole === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            🛡️ Admin ({pendingAdminCount})
          </button>
          <button
            onClick={() => onRoleChange('superadmin')}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap font-medium ${
              currentRole === 'superadmin' ? 'bg-rose-600 text-white' : 'text-slate-400'
            }`}
          >
            ⚙️ Superadmin
          </button>
        </div>
      </div>
    </header>
  );
};
