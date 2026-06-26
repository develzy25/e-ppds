import { renderThermalTemplate, ThermalReceiptPayload } from './thermal-template';
import { renderA4InvoiceTemplate, A4InvoicePayload } from './invoice-template';
import { generateReceiptSignature, generateVerificationUrl } from './qr-verification';

/**
 * Generates printer-ready HTML/CSS for 58mm and 80mm thermal receipt printers.
 */
export function generateThermalReceipt(
  preset: 'THERMAL_58' | 'THERMAL_80',
  payload: Omit<ThermalReceiptPayload, 'qrPayload'>,
  pondokId: string
): string {
  const signature = generateReceiptSignature(payload.receiptNumber, payload.totalAmount, pondokId);
  const qrPayload = generateVerificationUrl(payload.receiptNumber, signature);
  return renderThermalTemplate(preset, { ...payload, qrPayload });
}

/**
 * Generates printer-ready HTML/CSS for official A4 invoices.
 */
export function generateA4Invoice(
  payload: Omit<A4InvoicePayload, 'qrPayload'>,
  pondokId: string
): string {
  const signature = generateReceiptSignature(payload.invoiceNumber, payload.totalAmount, pondokId);
  const qrPayload = generateVerificationUrl(payload.invoiceNumber, signature);
  return renderA4InvoiceTemplate({ ...payload, qrPayload });
}
