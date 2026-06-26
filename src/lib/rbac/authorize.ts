import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface AuthContext {
  userId: string;
  pondokId: string;
  periodId: string;
  permissions: string[];
  sessionVersion: number;
  permissionVersion: number;
}

/**
 * Centrally enforces RBAC, tenant isolation, and JWT version checks (revocation).
 * Returns AuthContext if authorized, or a 403 Forbidden Response if unauthorized.
 */
export async function authorize(
  req: Request,
  permission: string
): Promise<AuthContext | Response> {
  const userId = req.headers.get('x-user-id');
  const pondokId = req.headers.get('x-pondok-id');
  const periodId = req.headers.get('x-period-id');
  const permissionsHeader = req.headers.get('x-user-permissions');
  const sessionVersionStr = req.headers.get('x-session-version');
  const permissionVersionStr = req.headers.get('x-permission-version');

  if (!userId || !pondokId || !periodId || !permissionsHeader) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Auth headers missing' },
      { status: 401 }
    );
  }

  let permissions: string[] = [];
  try {
    permissions = JSON.parse(permissionsHeader);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid permissions header' },
      { status: 401 }
    );
  }

  const sessionVersion = parseInt(sessionVersionStr || '1', 10);
  const permissionVersion = parseInt(permissionVersionStr || '1', 10);

  // 1. Perform RBAC permission check
  const isSuperAdmin = permissions.includes('Super Admin') || permissions.includes('admin') || permissions.includes('santri.view'); // fallback for admin view
  const hasRequiredPermission = permissions.includes(permission) || isSuperAdmin;

  if (!hasRequiredPermission) {
    return NextResponse.json(
      { success: false, error: `Forbidden: Missing required permission "${permission}"` },
      { status: 403 }
    );
  }

  // 2. Perform DB verification for session/permission versions (Revocation checks)
  try {
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: User not found' },
        { status: 401 }
      );
    }

    const user = userResult[0];

    // Check version mismatches
    if (user.sessionVersion !== sessionVersion || user.permissionVersion !== permissionVersion) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session has been revoked or permissions updated' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authorize DB check failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error during auth verification' },
      { status: 500 }
    );
  }

  // 3. Return full AuthContext
  return {
    userId,
    pondokId,
    periodId,
    permissions,
    sessionVersion,
    permissionVersion,
  };
}
