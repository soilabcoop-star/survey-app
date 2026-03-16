import { NextResponse } from 'next/server';
import { createSurveyCode, getProjectsWithStats } from '@/lib/stats';
import { getDb } from '@/lib/db';
import { initDb } from '@/lib/schema';
import { ProjectCategory } from '@/lib/types';

export async function GET() {
  try {
    const projects = getProjectsWithStats();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects', detail: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    initDb();
    const db = getDb();
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const description = String(body.description ?? '').trim();
    const category = (body.category ?? 'other') as ProjectCategory;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const surveyCode = createSurveyCode(category);
    const result = db
      .prepare(
        `
        INSERT INTO projects (name, description, category, status, survey_code)
        VALUES (?, ?, ?, 'draft', ?)
      `,
      )
      .run(name, description, category, surveyCode);

    return NextResponse.json({ id: result.lastInsertRowid, survey_code: surveyCode }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create project', detail: String(error) }, { status: 500 });
  }
}
