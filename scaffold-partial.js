const fs = require('fs');
const path = require('path');

const modules = [
  'laboratorium',
  'pos',
  'dms'
];

const basePath = path.join(__dirname, 'src', 'modules');

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const toPascalCase = (s) => s.split('-').map(capitalize).join('');

for (const mod of modules) {
  const modPath = path.join(basePath, mod);
  
  // Create directories
  const dirs = ['repositories', 'services', 'types', 'validators', 'actions', 'components', 'schemas'];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(modPath, dir), { recursive: true });
  }

  const pascalName = toPascalCase(mod);

  // 1. Schema
  const schemaPath = path.join(modPath, 'schemas', `${mod}.schema.ts`);
  if (!fs.existsSync(schemaPath)) {
    fs.writeFileSync(schemaPath, `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const ${mod}Table = sqliteTable('${mod}', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  pondokId: text('pondok_id').notNull(),
  createdAt: text('created_at').default(sql\`CURRENT_TIMESTAMP\`),
  updatedAt: text('updated_at').default(sql\`CURRENT_TIMESTAMP\`),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedBy: text('deleted_by'),
});
`);
  }

  // 2. Repository
  const repoPath = path.join(modPath, 'repositories', `${mod}.repository.ts`);
  if (!fs.existsSync(repoPath)) {
    fs.writeFileSync(repoPath, `import { BaseRepository, DbClient } from '@/infrastructure/database/repositories/base.repository';
import { ${mod}Table } from '../schemas/${mod}.schema';
import { eq, and } from 'drizzle-orm';

export class ${pascalName}Repository extends BaseRepository<typeof ${mod}Table> {
  constructor(dbClient?: DbClient) {
    super(${mod}Table, dbClient);
  }

  async findById(id: string) {
    const result = await this.databaseClient.select().from(this.table).where(eq(this.table.id, id));
    return result[0] || null;
  }
}
`);
  }

  // 3. Types
  const typePath = path.join(modPath, 'types', `${mod}.type.ts`);
  if (!fs.existsSync(typePath)) {
    fs.writeFileSync(typePath, `import { ${mod}Table } from '../schemas/${mod}.schema';

export type ${pascalName}Entity = typeof ${mod}Table.$inferSelect;
export type New${pascalName} = typeof ${mod}Table.$inferInsert;
`);
  }

  // 4. Validator
  const valPath = path.join(modPath, 'validators', `${mod}.validator.ts`);
  if (!fs.existsSync(valPath)) {
    fs.writeFileSync(valPath, `import { z } from 'zod';

export const create${pascalName}Schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  pondokId: z.string(),
});

export const update${pascalName}Schema = create${pascalName}Schema.extend({
  id: z.string(),
});
`);
  }

  // 5. Service
  const srvPath = path.join(modPath, 'services', `${mod}.service.ts`);
  if (!fs.existsSync(srvPath)) {
    fs.writeFileSync(srvPath, `import { IUnitOfWork } from '@/infrastructure/database/unit-of-work';
import { ${pascalName}Repository } from '../repositories/${mod}.repository';

export class ${pascalName}Service {
  constructor(private uow: IUnitOfWork) {}

  async getAll${pascalName}s(pondokId: string, userPermissions: string[]) {
    return this.uow.execute(async (repos, tx) => {
      const repo = new ${pascalName}Repository(tx);
      return [];
    });
  }
}
`);
  }

  // 6. Action
  const actPath = path.join(modPath, 'actions', `${mod}.action.ts`);
  if (!fs.existsSync(actPath)) {
    fs.writeFileSync(actPath, `'use server';

import { getCurrentUser as getRealUser } from '@/lib/services/auth';
import { UnitOfWork } from '@/infrastructure/database/unit-of-work';
import { ${pascalName}Service } from '../services/${mod}.service';
import { errorResponse, successResponse } from '@/shared/utils/action-error';

const service = new ${pascalName}Service(new UnitOfWork());

async function getCurrentUser() {
  const user = await getRealUser();
  if (!user) throw new Error('Unauthorized');
  return { id: user.userId, pondokId: user.pondokId, permissions: user.permissions };
}

export async function get${pascalName}s() {
  try {
    const user = await getCurrentUser();
    const data = await service.getAll${pascalName}s(user.pondokId, user.permissions);
    return successResponse(data);
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
`);
  }

  // 7. Component Client
  const compPath = path.join(modPath, 'components', `${pascalName}PageClient.tsx`);
  if (!fs.existsSync(compPath)) {
    fs.writeFileSync(compPath, `'use client';

import React from 'react';
import { PageHeader } from '@/components/master';

export function ${pascalName}PageClient() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Master ${pascalName}"
        description="Manajemen data ${mod}."
        breadcrumbs={[{ label: '${pascalName}' }]}
      />
      <div className="bg-card rounded-xl border p-8 text-center text-muted-foreground shadow-sm">
        Modul ${pascalName} belum diimplementasikan sepenuhnya.
      </div>
    </div>
  );
}
`);
  }

  console.log('Scaffolded partial ' + mod);
}
