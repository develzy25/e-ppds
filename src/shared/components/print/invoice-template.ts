import { PRINT_STYLES } from './print-styles';

export interface InvoiceItem {
  name: string;
  description: string;
  qty: number;
  price: number;
  total: number;
}

export interface A4InvoicePayload {
  pondokName: string;
  pondokAddress: string;
  pondokPhone: string;
  invoiceNumber: string;
  date: string;
  billingToName: string;
  billingToNis?: string;
  billingToKamar?: string;
  items: InvoiceItem[];
  totalAmount: number;
  signeeName: string;
  qrPayload: string;
}

export function renderA4InvoiceTemplate(payload: A4InvoicePayload): string {
  const itemsHtml = payload.items
    .map(
      (item, index) => `
    <tr>
      <td style="text-align: center;">${index + 1}</td>
      <td style="font-weight: bold;">${item.name}<br><span style="font-size: 11px; color: #666; font-weight: normal;">${item.description}</span></td>
      <td style="text-align: center;">${item.qty}</td>
      <td style="text-align: right;">Rp ${item.price.toLocaleString('id-ID')}</td>
      <td style="text-align: right; font-weight: bold;">Rp ${item.total.toLocaleString('id-ID')}</td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          ${PRINT_STYLES}
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- 1. Header (Kop Surat) -->
          <table class="invoice-header-table">
            <tr>
              <td class="invoice-logo-cell" style="vertical-align: middle;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="/logo-email.png" alt="Logo" style="height: 44px; width: 44px; object-fit: contain;" />
                  <div>
                    <div style="font-size: 16px; font-weight: 800; color: #10b981; line-height: 1.2;">${payload.pondokName}</div>
                    <div style="font-size: 10px; color: #555; font-weight: normal; margin-top: 2px; line-height: 1.3;">
                      ${payload.pondokAddress}<br>Telp: ${payload.pondokPhone}
                    </div>
                  </div>
                </div>
              </td>
              <td class="invoice-info-cell">
                <h2 style="margin: 0; color: #10b981; text-transform: uppercase;">KWITANSI RESMI</h2>
                <div style="margin-top: 8px;">
                  <strong>Nomor Kwitansi:</strong> ${payload.invoiceNumber}<br>
                  <strong>Tanggal Terbit:</strong> ${payload.date}
                </div>
              </td>
            </tr>
          </table>
          
          <div style="border-top: 3px solid #10b981; margin-bottom: 20px;"></div>
          
          <!-- 2. Billing details -->
          <table style="width: 100%; font-size: 12px; margin-bottom: 20px;">
            <tr>
              <td style="width: 50%; vertical-align: top;">
                <span style="color: #666; text-transform: uppercase; font-size: 10px; font-weight: bold;">Diberikan Kepada:</span><br>
                <strong style="font-size: 14px;">${payload.billingToName}</strong><br>
                ${payload.billingToNis ? `NIS: ${payload.billingToNis}<br>` : ''}
                ${payload.billingToKamar ? `Asrama: ${payload.billingToKamar}` : ''}
              </td>
              <td style="width: 50%; text-align: right; vertical-align: top;">
                <span style="color: #666; text-transform: uppercase; font-size: 10px; font-weight: bold;">Metode Transaksi:</span><br>
                <strong>TUNAI / LEDGER SANTRI</strong><br>
                Status: <span style="color: #10b981; font-weight: bold;">LUNAS</span>
              </td>
            </tr>
          </table>
          
          <!-- 3. Items Table -->
          <table class="invoice-details-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">No</th>
                <th style="width: 50%;">Deskripsi Jasa / Barang</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Harga Satuan</th>
                <th style="width: 20%; text-align: right;">Total Harga</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <!-- 4. Summary & QR -->
          <div style="display: flex; justify-content: space-between; margin-top: 24px; font-size: 13px;">
            <!-- Verification QR Section -->
            <div style="display: flex; align-items: center; border: 1px solid #e5e7eb; padding: 10px; border-radius: 8px; background-color: #f9fafb;">
              <div class="qr-code-placeholder" style="margin: 0 12px 0 0;">
                <span style="font-size: 8px;">QR VERIFY<br>${payload.invoiceNumber}</span>
              </div>
              <div>
                <strong style="color: #10b981; font-size: 11px;">E-VERIFIKASI RESMI</strong><br>
                <span style="font-size: 10px; color: #666; line-height: 1.2; display: block; margin-top: 2px;">
                  Scan QR code ini untuk memvalidasi<br>kesahihan tanda bukti pembayaran ini<br>pada database SIM-PPDS.
                </span>
              </div>
            </div>
            
            <div class="invoice-summary-box">
              <div class="receipt-row" style="font-size: 15px; font-weight: bold; border-top: 2px solid #333; padding-top: 8px;">
                <div>TOTAL BAYAR:</div>
                <div style="color: #10b981;">Rp ${payload.totalAmount.toLocaleString('id-ID')}</div>
              </div>
            </div>
          </div>
          
          <!-- 5. Signatures -->
          <div class="invoice-signature-section">
            <div>
              <p style="margin-bottom: 60px; font-size: 11px; color: #666;">Pembayar,</p>
              <div class="invoice-signature-box">${payload.billingToName}</div>
            </div>
            <div>
              <p style="margin-bottom: 60px; font-size: 11px; color: #666;">Petugas Kasir/Bendahara,</p>
              <div class="invoice-signature-box">${payload.signeeName}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
