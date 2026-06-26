/**
 * Core event action codes for e-ppds system audit logs.
 */
export const AUDIT_EVENTS = {
  // Authentication & Session
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_REVOKED: 'AUTH_REVOKED',
  
  // Billing & Transactions
  BILLING_PAID: 'BILLING_PAID',
  BILLING_VOIDED: 'BILLING_VOIDED',
  CASHBOOK_RECORD: 'CASHBOOK_RECORD',

  // Workflow approvals
  APPROVAL_START: 'APPROVAL_START',
  APPROVAL_APPROVE: 'APPROVAL_APPROVE',
  APPROVAL_REJECT: 'APPROVAL_REJECT',
  APPROVAL_CANCEL: 'APPROVAL_CANCEL',

  // Master Settings
  SETTINGS_UPDATE: 'SETTINGS_UPDATE',
  ROLE_MUTATED: 'ROLE_MUTATED'
} as const;

export type AuditEvent = typeof AUDIT_EVENTS[keyof typeof AUDIT_EVENTS];
