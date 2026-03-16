import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM field_types ORDER BY sort_order ASC, id ASC').all();
    return NextResponse.json({ success: true, data: rows });
  } catch {
    return NextResponse.json({ success: false, error: '조회 실패' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, placeholder } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: '항목명을 입력하세요' }, { status: 400 });
    }

    const db = getDb();
    const maxOrder = (db.prepare('SELECT MAX(sort_order) as m FROM field_types').get() as { m: number | null }).m ?? 0;
    const result = db
      .prepare('INSERT INTO field_types (name, placeholder, sort_order) VALUES (?, ?, ?)')
      .run(name.trim(), placeholder?.trim() || null, maxOrder + 1);
    const inserted = db.prepare('SELECT * FROM field_types WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, data: inserted });
  } catch {
    return NextResponse.json({ success: false, error: '추가 실패' }, { status: 500 });
  }
}
