import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initDb } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    initDb();
    const db = getDb();
    const body = await request.json();

    const projectId = Number(body.project_id);
    const type = String(body.type ?? 'likert5');
    const text = String(body.text ?? '').trim();
    const options = body.options ? JSON.stringify(body.options) : null;
    const required = body.required ? 1 : 0;
    const isOverall = body.is_overall ? 1 : 0;

    if (!projectId || !text) {
      return NextResponse.json({ error: 'project_id and text are required' }, { status: 400 });
    }

    const row = db
      .prepare('SELECT COALESCE(MAX(order_index), 0) as idx FROM questions WHERE project_id = ?')
      .get(projectId) as { idx: number };

    const result = db
      .prepare(
        `
        INSERT INTO questions (project_id, order_index, type, text, options, required, is_overall)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .run(projectId, Number(row?.idx ?? 0) + 1, type, text, options, required, isOverall);

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create question', detail: String(error) }, { status: 500 });
  }
}
