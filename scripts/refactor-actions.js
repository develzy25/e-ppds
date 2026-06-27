const fs = require('fs');
const path = require('path');

console.log('[Refactor] Beginning Server Actions refactoring...');

const actionFiles = [
  'src/modules/master/sekolah/actions/sekolah.action.ts',
  'src/modules/master/tahun-ajaran/actions/tahun-ajaran.action.ts',
  'src/modules/master/role/actions/role.action.ts',
  'src/modules/master/santri/actions/santri.action.ts',
  'src/modules/master/periode/actions/periode.action.ts',
  'src/modules/master/permission/actions/permission.action.ts',
  'src/modules/master/kamar/actions/kamar.action.ts',
  'src/modules/master/kelas/actions/kelas.action.ts',
  'src/modules/master/pengurus/actions/pengurus.action.ts',
  'src/modules/master/department/actions/department.action.ts',
  'src/modules/master/jabatan/actions/jabatan.action.ts',
  'src/modules/keuangan/tarif/actions/tarif.action.ts',
  'src/modules/keuangan/jenis-tagihan/actions/jenis-tagihan.action.ts',
  'src/modules/master/blok/actions/blok.action.ts',
];

for (const file of actionFiles) {
  const filepath = path.resolve(file);
  if (!fs.existsSync(filepath)) {
    console.warn(`[Refactor] File not found: ${file}`);
    continue;
  }

  let content = fs.readFileSync(filepath, 'utf8');

  if (content.includes('async function getCurrentUser()')) {
    // 1. Replace the mock function with the real database logic
    const refactoredFunc = `async function getCurrentUser() {
  const user = await getRealUser();
  if (!user) {
    throw new Error('Unauthorized: Sesi tidak ditemukan atau kedaluwarsa');
  }
  return {
    id: user.userId,
    pondokId: user.pondokId,
    permissions: user.permissions,
  };
}`;

    // Replace from async function getCurrentUser() until the closing function brace
    const newContent = content.replace(/async function getCurrentUser\(\)\s*\{[\s\S]*?\};\s*\}/, refactoredFunc);

    // 2. Append the import at the top
    let finalContent = newContent;
    if (!finalContent.includes('import { getCurrentUser as getRealUser }')) {
      finalContent = finalContent.replace(
        "'use server';",
        "'use server';\n\nimport { getCurrentUser as getRealUser } from '@/lib/services/auth';"
      );
    }

    fs.writeFileSync(filepath, finalContent, 'utf8');
    console.log(`[Refactor] Successfully refactored: ${file}`);
  } else {
    console.log(`[Refactor] Skipped (already refactored or no mock found): ${file}`);
  }
}

console.log('[Refactor] Refactoring completed.');
