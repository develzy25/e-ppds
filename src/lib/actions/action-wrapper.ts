'use server';

// Temporary mock user for now, until NextAuth is implemented
async function getCurrentUser() {
  return {
    id: 'u1',
    pondokId: 'pondok-1',
    permissions: [
      'master.role.view', 'master.role.create', 'master.role.update', 'master.role.delete',
      'master.department.view', 'master.department.create', 'master.department.update', 'master.department.delete',
      'master.periode.view', 'master.periode.create', 'master.periode.update', 'master.periode.delete',
      'master.tahun-ajaran.view', 'master.tahun-ajaran.create', 'master.tahun-ajaran.update', 'master.tahun-ajaran.delete',
      'master.blok.view', 'master.blok.create', 'master.blok.update', 'master.blok.delete',
      'master.kamar.view', 'master.kamar.create', 'master.kamar.update', 'master.kamar.delete',
      'master.sekolah.view', 'master.sekolah.create', 'master.sekolah.update', 'master.sekolah.delete',
      'master.kelas.view', 'master.kelas.create', 'master.kelas.update', 'master.kelas.delete',
      'master.pengurus.view', 'master.pengurus.create', 'master.pengurus.update', 'master.pengurus.delete',
      'master.santri.view', 'master.santri.create', 'master.santri.update', 'master.santri.delete',
    ],
  };
}

export type ActionResponse<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string };

type ActionHandler<T, R> = (user: { id: string; pondokId: string; permissions: string[] }, input: T) => Promise<R>;

/**
 * Standard wrapper for server actions to handle Auth, try/catch, and standard response.
 */
export async function withAuthAction<T, R>(
  handler: ActionHandler<T, R>,
  input?: T
): Promise<ActionResponse<R>> {
  try {
    const user = await getCurrentUser();
    const result = await handler(user, input as T);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}
