import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { brief_id, overall_note, items } = await req.json();

    if (!brief_id) {
      return NextResponse.json({ success: false, error: '의뢰서 ID가 필요합니다' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '수정 항목을 1개 이상 추가하세요' },
        { status: 400 },
      );
    }

    const hasEmptyDescription = items.some((item: { description?: string }) => !item.description?.trim());
    if (hasEmptyDescription) {
      return NextResponse.json(
        { success: false, error: '모든 항목에 수정 내용 설명을 입력하세요' },
        { status: 400 },
      );
    }

    const db = getDb();
    const lastRevision = db
      .prepare('SELECT MAX(round) as max_round FROM revisions WHERE brief_id = ?')
      .get(brief_id) as { max_round: number | null };
    const nextRound = (lastRevision.max_round ?? 0) + 1;

    const revisionResult = db
      .prepare(
        `
        INSERT INTO revisions (brief_id, round, overall_note)
        VALUES (?, ?, ?)
        `,
      )
      .run(brief_id, nextRound, overall_note || null);

    const revisionId = Number(revisionResult.lastInsertRowid);
    const insertItem = db.prepare(
      `
      INSERT INTO revision_items (revision_id, image_path, crop_data, description, sort_order)
      VALUES (?, ?, ?, ?, ?)
      `,
    );

    items.forEach(
      (
        item: {
          image_path?: string;
          crop_data?: unknown;
          description: string;
        },
        index: number,
      ) => {
        insertItem.run(
          revisionId,
          item.image_path || null,
          item.crop_data ? JSON.stringify(item.crop_data) : null,
          item.description.trim(),
          index,
        );
      },
    );

    db.prepare("UPDATE briefs SET status = 'revising' WHERE id = ?").run(brief_id);

    return NextResponse.json({ success: true, data: { id: revisionId, round: nextRound } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: '저장 실패' }, { status: 500 });
  }
}
