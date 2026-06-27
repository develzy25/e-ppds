const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

console.log('[Migration] Starting SQLite database migration...');

function addColumn(table, column, type, defaultValue = null) {
  try {
    let sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${type}`;
    if (defaultValue !== null) {
      sql += ` DEFAULT ${defaultValue}`;
    }
    db.prepare(sql).run();
    console.log(`[Migration] Added column ${column} to table ${table}`);
  } catch (e) {
    if (e.message.includes('duplicate column name') || e.message.includes('already exists')) {
      console.log(`[Migration] Column ${column} already exists in table ${table}`);
    } else {
      console.error(`[Migration] Failed to add column ${column} to ${table}:`, e.message);
    }
  }
}

// Update users table
addColumn('users', 'pin', 'TEXT');
addColumn('users', 'failed_login_attempts', 'INTEGER', 0);
addColumn('users', 'locked_until', 'TEXT');

// Update user_sessions table
addColumn('user_sessions', 'ip_address', 'TEXT');
addColumn('user_sessions', 'device', 'TEXT');
addColumn('user_sessions', 'browser', 'TEXT');
addColumn('user_sessions', 'os', 'TEXT');
addColumn('user_sessions', 'user_agent', 'TEXT');
addColumn('user_sessions', 'last_activity', 'TEXT');

console.log('[Migration] Database migration completed.');
