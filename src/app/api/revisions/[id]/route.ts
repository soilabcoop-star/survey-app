import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const revision = db.prepare('SELECT * FROM revisions WHERE id = ?').get(params.id);

    if (!revision) {
      return NextResponse.json({ success: false, error: '수정요청을 찾을 수 없습니다' }, { status: 404 });
    }

    const items = db
      .prepare('SELECT * FROM revision_items WHERE revision_id = ? ORDER BY sort_order ASC')
      .all(params.id);

    return NextResponse.json({ success: true, data: { ...(revision as object), items } });
  } catch {
    return NextResponse.json({ success: false, error: '조회 실패' }, { status: 500 });
  }
}
