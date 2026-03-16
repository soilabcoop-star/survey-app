import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const briefs = db
      .prepare(
        `
        SELECT b.*,
          (SELECT COUNT(*) FROM revisions WHERE brief_id = b.id) as revision_count
        FROM briefs b
        ORDER BY b.created_at DESC
        `,
      )
      .all();

    return NextResponse.json({ success: true, data: briefs });
  } catch {
    return NextResponse.json({ success: false, error: '조회 실패' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project_name, reference, concept, draft_deadline, fields } = body;

    if (!project_name?.trim()) {
      return NextResponse.json({ success: false, error: '프로젝트명을 입력하세요' }, { status: 400 });
    }

    if (!draft_deadline) {
      return NextResponse.json({ success: false, error: '초안 기한을 입력하세요' }, { status: 400 });
    }

    const db = getDb();
    const briefResult = db
      .prepare(
        `
        INSERT INTO briefs (project_name, reference, concept, draft_deadline)
        VALUES (?, ?, ?, ?)
        `,
      )
      .run(project_name.trim(), reference || null, concept || null, draft_deadline);

    const briefId = Number(briefResult.lastInsertRowid);

    if (Array.isArray(fields) && fields.length > 0) {
      const insertField = db.prepare(
        `
        INSERT INTO brief_fields (brief_id, field_type_id, field_name, content, sort_order)
        VALUES (?, ?, ?, ?, ?)
        `,
      );

      fields.forEach((field: { field_type_id: number; field_name: string; content?: string }, index: number) => {
        insertField.run(briefId, field.field_type_id, field.field_name, field.content || null, index);
      });
    }

    return NextResponse.json({ success: true, data: { id: briefId } });
  } catch {
    return NextResponse.json({ success: false, error: '저장 실패' }, { status: 500 });
  }
}
