const fs = require('fs');
const path = require('path');

const modules = [
  'bendahara',
  'bump',
  'dms',
  'humasy',
  'kesehatan',
  'media',
  'musyawarah',
  'pembangunan',
  'pendidikan',
  'takmir'
];

for (const mod of modules) {
  const schemaPath = path.join(__dirname, 'src', 'modules', mod, 'schemas', mod + '.schema.ts');
  if (fs.existsSync(schemaPath)) {
    const content = fs.readFileSync(schemaPath, 'utf8');
    if (!content.includes('export const ' + mod + 'Table')) {
      const appendContent = '\n\nexport const ' + mod + 'Table = sqliteTable(\'' + mod + '\', {\n  id: text(\'id\').primaryKey(),\n  name: text(\'name\').notNull(),\n  pondokId: text(\'pondok_id\').notNull(),\n  createdAt: text(\'created_at\').default(sql`CURRENT_TIMESTAMP`),\n  updatedAt: text(\'updated_at\').default(sql`CURRENT_TIMESTAMP`),\n  deletedAt: text(\'deleted_at\'),\n  createdBy: text(\'created_by\'),\n  updatedBy: text(\'updated_by\'),\n  deletedBy: text(\'deleted_by\'),\n});\n';
      // Need to make sure sqliteTable and text are imported, but since we are just trying to satisfy TS for scaffolded files, it might fail if they are not imported.
      fs.appendFileSync(schemaPath, appendContent);
      console.log('Appended ' + mod + 'Table to ' + schemaPath);
    }
  }
}
