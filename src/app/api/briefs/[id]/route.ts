import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const brief = db.prepare('SELECT * FROM briefs WHERE id = ?').get(params.id);

    if (!brief) {
      return NextResponse.json({ success: false, error: '의뢰서를 찾을 수 없습니다' }, { status: 404 });
    }

    const fields = db
      .prepare('SELECT * FROM brief_fields WHERE brief_id = ? ORDER BY sort_order ASC')
      .all(params.id);
    const revisions = db
      .prepare(
        'SELECT id, round, status, overall_note, created_at FROM revisions WHERE brief_id = ? ORDER BY round DESC',
      )
      .all(params.id);

    return NextResponse.json({ success: true, data: { ...(brief as object), fields, revisions } });
  } catch {
    return NextResponse.json({ success: false, error: '조회 실패' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const db = getDb();
    db.prepare('UPDATE briefs SET status = ? WHERE id = ?').run(status, params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: '수정 실패' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM briefs WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: '삭제 실패' }, { status: 500 });
  }
}
