import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const inUse = db
      .prepare('SELECT COUNT(*) as cnt FROM brief_fields WHERE field_type_id = ?')
      .get(params.id) as { cnt: number };

    if (inUse.cnt > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `이미 ${inUse.cnt}개 의뢰서에서 사용 중인 항목입니다. 삭제할 수 없습니다.`,
        },
        { status: 409 },
      );
    }

    db.prepare('DELETE FROM field_types WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: '삭제 실패' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const db = getDb();

    if (body.sort_order !== undefined) {
      db.prepare('UPDATE field_types SET sort_order = ? WHERE id = ?').run(body.sort_order, params.id);
    }

    if (body.placeholder !== undefined) {
      db.prepare('UPDATE field_types SET placeholder = ? WHERE id = ?').run(body.placeholder, params.id);
    }

    const updated = db.prepare('SELECT * FROM field_types WHERE id = ?').get(params.id);
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: '수정 실패' }, { status: 500 });
  }
}
