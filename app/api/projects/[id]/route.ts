import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initDb } from '@/lib/schema';
import { getProjectStat, getQuestions, getRawResponses } from '@/lib/stats';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const projectId = Number(id);
    const stats = getProjectStat(projectId);
    if (!stats) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const responses = getRawResponses(projectId).slice(0, 300);

    return NextResponse.json({
      ...stats,
      questions: getQuestions(projectId),
      responses,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project', detail: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    initDb();
    const db = getDb();
    const { id } = await context.params;
    const projectId = Number(id);
    const body = await request.json();

    const fields = ['name', 'description', 'category', 'status'] as const;
    const updates: string[] = [];
    const values: unknown[] = [];

    for (const field of fields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (body.status === 'closed') {
      updates.push("closed_at = datetime('now','localtime')");
    }

    if (!updates.length) return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });

    values.push(projectId);
    db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project', detail: String(error) }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    initDb();
    const db = getDb();
    const { id } = await context.params;
    const projectId = Number(id);
    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project', detail: String(error) }, { status: 500 });
  }
}

