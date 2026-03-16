import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initDb } from '@/lib/schema';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    initDb();
    const db = getDb();
    const { id } = await context.params;
    const questionId = Number(id);
    const body = await request.json();

    const updates: string[] = [];
    const values: unknown[] = [];

    if (body.type !== undefined) {
      updates.push('type = ?');
      values.push(body.type);
    }
    if (body.text !== undefined) {
      updates.push('text = ?');
      values.push(body.text);
    }
    if (body.options !== undefined) {
      updates.push('options = ?');
      values.push(body.options ? JSON.stringify(body.options) : null);
    }
    if (body.required !== undefined) {
      updates.push('required = ?');
      values.push(body.required ? 1 : 0);
    }
    if (body.is_overall !== undefined) {
      updates.push('is_overall = ?');
      values.push(body.is_overall ? 1 : 0);
    }
    if (body.order_index !== undefined) {
      updates.push('order_index = ?');
      values.push(Number(body.order_index));
    }

    if (!updates.length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(questionId);
    db.prepare(`UPDATE questions SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update question', detail: String(error) }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    initDb();
    const db = getDb();
    const { id } = await context.params;
    db.prepare('DELETE FROM questions WHERE id = ?').run(Number(id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete question', detail: String(error) }, { status: 500 });
  }
}
