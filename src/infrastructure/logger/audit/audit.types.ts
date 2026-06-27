export interface AuditLogPayload {
  module: string;
  entityName: string;
  entityId: string;
  action: string;
  beforeData?: unknown;
  afterData?: unknown;
  performedBy: string;
  remarks?: string;
}
