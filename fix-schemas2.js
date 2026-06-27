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
      const appendContent = '\n\nimport { sqliteTable as sqliteTableGen' + mod + ', text as textGen' + mod + ' } from \'drizzle-orm/sqlite-core\';\nimport { sql as sqlGen' + mod + ' } from \'drizzle-orm\';\nexport const ' + mod + 'Table = sqliteTableGen' + mod + '(\'' + mod + '_gen\', {\n  id: textGen' + mod + '(\'id\').primaryKey(),\n  name: textGen' + mod + '(\'name\').notNull(),\n  pondokId: textGen' + mod + '(\'pondok_id\').notNull(),\n});\n';
      fs.appendFileSync(schemaPath, appendContent);
      console.log('Appended ' + mod + 'Table to ' + schemaPath);
    }
  }
}
