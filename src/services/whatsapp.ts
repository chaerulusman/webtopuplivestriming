import { Transaction, SystemSettings } from '../types';

export interface WhatsAppNotificationPayload {
  recipient: string;
  message: string;
  timestamp: string;
  orderId: string;
  status: 'sent' | 'simulated';
}

export class WhatsAppService {
  static formatMessage(tx: Transaction, settings: SystemSettings): string {
    const template =
      settings.whatsappGateway.templateMessage ||
      'Halo Kak *{name}*! 🎉 Pembelian *{amount} {currency}* untuk akun *{appName}* (ID: *{userId}*) telah BERHASIL. Total: *{total}* (Order ID: *{orderId}*). Terima kasih telah top-up di StreamPay ID!';

    let msg = template
      .replace('{name}', tx.userId || 'Pelanggan')
      .replace('{appName}', tx.appName)
      .replace('{amount}', tx.packageAmount.toLocaleString('id-ID'))
      .replace('{currency}', tx.currencyName)
      .replace('{userId}', tx.userId + (tx.zoneId ? ` (${tx.zoneId})` : ''))
      .replace('{total}', `Rp ${tx.totalAmount.toLocaleString('id-ID')}`)
      .replace('{orderId}', tx.id);

    return msg;
  }

  static getDirectWhatsAppLink(tx: Transaction, settings: SystemSettings): string {
    const cleanPhone = tx.userWhatsapp.replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }
    const message = this.formatMessage(tx, settings);
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  }

  static async sendNotification(
    tx: Transaction,
    settings: SystemSettings
  ): Promise<WhatsAppNotificationPayload> {
    const msg = this.formatMessage(tx, settings);
    
    // Simulate real webhook delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      recipient: tx.userWhatsapp,
      message: msg,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      orderId: tx.id,
      status: 'sent',
    };
  }
}
