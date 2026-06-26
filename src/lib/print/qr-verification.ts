import crypto from 'crypto';

const VERIFICATION_SECRET = process.env.VERIFICATION_SECRET || 'ppds-receipt-verify-secret-key-12345';

/**
 * Generates a short, secure digital signature hash for transaction receipt auditing.
 */
export function generateReceiptSignature(transactionId: string, totalAmount: number, pondokId: string): string {
  const data = `${transactionId}:${totalAmount}:${pondokId}`;
  return crypto.createHmac('sha256', VERIFICATION_SECRET).update(data).digest('hex').substring(0, 16);
}

/**
 * Constructs the verification query URL for receipt audits.
 */
export function generateVerificationUrl(transactionId: string, signature: string): string {
  return `/api/verify/${transactionId}?sig=${signature}`;
}
