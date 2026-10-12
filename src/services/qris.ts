import QRCode from 'qrcode';

export class QrisService {
  /**
   * Generates a realistic Indonesian dynamic QRIS data string and DataURL image.
   */
  static async generateQrisCode(
    orderId: string,
    amount: number,
    merchantName: string = 'STREAMPAY DIGITAL ID'
  ): Promise<{ payload: string; dataUrl: string }> {
    // Standard EMVCo / QRIS string structure simulation
    const amountStr = amount.toString();
    const payload = `00020101021226680016ID.CO.QRIS.WWW011893600918002160012802150000000000000000303UMI51440014ID.DOKU.WWW0215${orderId}520454115303360540${amountStr.length.toString().padStart(2, '0')}${amountStr}5802ID59${merchantName.length.toString().padStart(2, '0')}${merchantName}6013JAKARTA SEL62280724${orderId}6304AC78`;

    try {
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      return { payload, dataUrl };
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
      // Fallback dataUrl
      return {
        payload,
        dataUrl: '',
      };
    }
  }
}
