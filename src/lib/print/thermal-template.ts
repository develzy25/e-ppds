import { PRINT_STYLES } from './print-styles';

export interface ThermalItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface ThermalReceiptPayload {
  title: string;
  subtitle: string;
  receiptNumber: string;
  date: string;
  cashierName: string;
  paymentMethod: string;
  items: ThermalItem[];
  totalAmount: number;
  qrPayload: string;
}

export function renderThermalTemplate(
  preset: 'THERMAL_58' | 'THERMAL_80',
  payload: ThermalReceiptPayload
): string {
  const width = preset === 'THERMAL_58' ? '228px' : '302px';
  const fontSize = preset === 'THERMAL_58' ? '11px' : '12px';

  const itemsHtml = payload.items
    .map(
      (item) => `
    <div class="receipt-row">
      <div class="receipt-col-left">${item.name}</div>
    </div>
    <div class="receipt-row" style="padding-left: 8px;">
      <div class="receipt-col-left">${item.qty} x Rp ${item.price.toLocaleString('id-ID')}</div>
      <div class="receipt-col-right">Rp ${item.total.toLocaleString('id-ID')}</div>
    </div>
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
          .receipt-container {
            width: ${width};
            font-size: ${fontSize};
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <div style="margin-bottom: 6px; display: flex; justify-content: center;">
              <img src="/logo-footer.png" alt="Logo" style="height: 24px; width: 24px; object-fit: contain; filter: grayscale(100%);" />
            </div>
            <div class="receipt-title">${payload.title}</div>
            <div style="font-size: 10px; margin-top: 2px;">${payload.subtitle}</div>
          </div>
          
          <div class="receipt-row">
            <div>Nota: ${payload.receiptNumber}</div>
          </div>
          <div class="receipt-row">
            <div>Tgl: ${payload.date}</div>
          </div>
          <div class="receipt-row">
            <div>Kasir: ${payload.cashierName}</div>
          </div>
          
          <div class="receipt-divider"></div>
          
          <div style="margin: 6px 0;">
            ${itemsHtml}
          </div>
          
          <div class="receipt-divider"></div>
          
          <div class="receipt-row" style="font-weight: bold;">
            <div>TOTAL:</div>
            <div>Rp ${payload.totalAmount.toLocaleString('id-ID')}</div>
          </div>
          
          <div class="receipt-row">
            <div>Bayar: ${payload.paymentMethod}</div>
          </div>
          
          <div class="receipt-double-divider"></div>
          
          <div class="receipt-footer">
            <div>Terima Kasih</div>
            <div style="font-size: 9px; color: #555; margin-top: 4px;">Validasi Keaslian Struk:</div>
            <!-- Simulates QR Code validation link -->
            <div class="qr-code-placeholder">
              <span style="font-size: 8px;">QR VERIFY<br>${payload.receiptNumber}</span>
            </div>
            <div style="font-size: 8px; color: #777;">Scan QR untuk e-Verifikasi</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
