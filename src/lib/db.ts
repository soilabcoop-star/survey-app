import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'design-requests.db');

let db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }

  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS field_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      placeholder TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS briefs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      reference TEXT,
      concept TEXT,
      draft_deadline TEXT NOT NULL,
      status TEXT DEFAULT 'requested',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS brief_fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brief_id INTEGER NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
      field_type_id INTEGER NOT NULL REFERENCES field_types(id),
      field_name TEXT NOT NULL,
      content TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brief_id INTEGER NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
      round INTEGER DEFAULT 1,
      overall_note TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS revision_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      revision_id INTEGER NOT NULL REFERENCES revisions(id) ON DELETE CASCADE,
      image_path TEXT,
      crop_data TEXT,
      description TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );
  `);

  const existing = database.prepare('SELECT COUNT(*) as cnt FROM field_types').get() as {
    cnt: number;
  };

  if (existing.cnt === 0) {
    const insert = database.prepare(
      'INSERT INTO field_types (name, placeholder, sort_order) VALUES (?, ?, ?)',
    );
    const seeds: Array<[string, string, number]> = [
      ['제목', '예) 2025 청년 모집 공고', 1],
      ['부제목', '예) 함께 성장하는 소이랩 청년 프로그램', 2],
      ['모집기간', '예) 2025년 3월 1일 ~ 3월 31일', 3],
      ['모집내용', '예) 지역 청년 20명, 월 2회 활동', 4],
      ['문의처', '예) 소이랩 053-941-9003', 5],
    ];

    for (const [name, placeholder, sortOrder] of seeds) {
      insert.run(name, placeholder, sortOrder);
    }
  }
}
