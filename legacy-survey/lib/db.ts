import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'survey.db');

declare global {
  // eslint-disable-next-line no-var
  var __soilab_db__: Database.Database | undefined;
}

export function getDb() {
  if (!global.__soilab_db__) {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    global.__soilab_db__ = new Database(DB_PATH);
    global.__soilab_db__.pragma('journal_mode = WAL');
    global.__soilab_db__.pragma('foreign_keys = ON');
  }
  return global.__soilab_db__;
}

export const DB_PATH_ABS = DB_PATH;
