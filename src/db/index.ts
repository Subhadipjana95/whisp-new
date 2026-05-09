import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as schema from './schema';
import migrations from './migrations/migrations';

const expo = SQLite.openDatabaseSync('notevoice.db', {
  enableChangeListener: true,
});

export const db = drizzle(expo, { schema });

export async function runMigrations(): Promise<void> {
  try {
    await migrate(db, migrations);
    console.log('[DB] Migrations completed successfully');
  } catch (error) {
    console.error('[DB] Migration error:', error);
    throw error;
  }
}
