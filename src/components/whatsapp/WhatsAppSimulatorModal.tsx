import React from 'react';
import { Transaction, SystemSettings } from '../../types';
import { WhatsAppService } from '../../services/whatsapp';
import {
  X,
  CheckCheck,
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
  BadgeCheck,
} from 'lucide-react';

interface WhatsAppSimulatorModalProps {
  lastTransaction?: Transaction;
  settings: SystemSettings;
  onClose: () => void;
}

export const WhatsAppSimulatorModal: React.FC<WhatsAppSimulatorModalProps> = ({
  lastTransaction,
  settings,
  onClose,
}) => {
  const defaultSampleTx: Transaction = lastTransaction || {
    id: 'STP-88421',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    appId: 'tiktok-live',
    appName: 'TikTok Live',
    userId: '@streamer_bella',
    userWhatsapp: '081299887766',
    packageId: 'tt-4',
    packageName: '1.400 Koin',
    packageAmount: 1400,
    currencyName: 'Koin TikTok',
    basePrice: 282000,
    uniqueCode: 421,
    totalAmount: 282421,
    paymentMethod: 'bank_transfer',
    status: 'success',
    referralCode: 'ANDRI88',
    referralCommission: 11280,
    whatsappSent: true,
  };

  const messageText = WhatsAppService.formatMessage(defaultSampleTx, settings);
  const currentTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm bg-[#0b141a] rounded-[32px] shadow-2xl border-4 border-slate-800 overflow-hidden text-slate-100 flex flex-col h-[580px]">
        {/* WhatsApp Mobile Top Bar */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md">
              SP
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-slate-100">StreamPay Official</span>
                <BadgeCheck className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              </div>
              <p className="text-[10px] text-emerald-400">Akun Bisnis Terverifikasi</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <Video className="w-4 h-4 cursor-pointer" />
            <Phone className="w-4 h-4 cursor-pointer" />
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Body (WhatsApp Background Pattern) */}
        <div
          className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col justify-end"
          style={{
            backgroundColor: '#0b141a',
            backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        >
          {/* Security Banner */}
          <div className="bg-[#182229] text-[#8696a0] text-[10px] text-center p-2 rounded-lg max-w-[85%] mx-auto shadow-sm">
            🔒 Pesan dan panggilan dienkripsi secara end-to-end melalui Fonnte / Wablas API Gateway.
          </div>

          {/* Incoming Message Bubble */}
          <div className="self-start max-w-[88%] bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tl-none p-3 shadow-md space-y-1 text-xs">
            <div className="font-semibold text-emerald-300 text-[11px] pb-1 border-b border-emerald-700/50 flex justify-between items-center">
              <span>🔔 NOTIFIKASI PEMBAYARAN RESMI</span>
              <span className="text-[9px] text-emerald-200 uppercase font-mono">
                {defaultSampleTx.id}
              </span>
            </div>

            <p className="whitespace-pre-wrap leading-relaxed text-[11px] pt-1">
              {messageText}
            </p>

            <div className="flex items-center justify-end gap-1 pt-1 text-[10px] text-emerald-200/80">
              <span>{currentTime}</span>
              <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
            </div>
          </div>
        </div>

        {/* WhatsApp Bottom Input Bar */}
        <div className="bg-[#1f2c34] p-2 flex items-center gap-2">
          <Smile className="w-5 h-5 text-slate-400 ml-1" />
          <Paperclip className="w-5 h-5 text-slate-400" />
          <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-xs text-slate-300">
            Ketik pesan...
          </div>
          <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white">
            <Mic className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
