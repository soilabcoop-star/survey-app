import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { initDb } from '@/lib/schema';
import { getProjectByCode, getQuestions, getRawResponses } from '@/lib/stats';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = Number(url.searchParams.get('project_id'));
    if (!projectId) return NextResponse.json({ error: 'project_id is required' }, { status: 400 });

    return NextResponse.json(getRawResponses(projectId));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch responses', detail: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    initDb();
    const db = getDb();
    const body = await request.json();

    const surveyCode = String(body.survey_code ?? '');
    const sessionId = String(body.session_id ?? '');
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (!surveyCode || !sessionId || !answers.length) {
      return NextResponse.json({ error: 'survey_code, session_id, answers are required' }, { status: 400 });
    }

    const project = getProjectByCode(surveyCode) as { id: number } | undefined;
    if (!project) return NextResponse.json({ error: 'Invalid survey code' }, { status: 404 });

    const duplicate = db
      .prepare('SELECT id FROM survey_responses WHERE project_id = ? AND session_id = ?')
      .get(project.id, sessionId);
    if (duplicate) {
      return NextResponse.json({ error: 'Already responded' }, { status: 409 });
    }

    const questions = getQuestions(project.id);
    const requiredIds = questions.filter((q) => q.required).map((q) => q.id);
    const answerMap = new Map<number, string>();

    for (const item of answers) {
      const qid = Number(item.question_id);
      if (!qid) continue;
      const value = typeof item.value === 'string' ? item.value : JSON.stringify(item.value ?? '');
      answerMap.set(qid, value);
    }

    for (const questionId of requiredIds) {
      const value = answerMap.get(questionId);
      if (value === undefined || value === '') {
        return NextResponse.json({ error: 'Required questions are missing' }, { status: 400 });
      }
    }

    const tx = db.transaction(() => {
      const responseId = db
        .prepare('INSERT INTO survey_responses (project_id, session_id) VALUES (?, ?)')
        .run(project.id, sessionId).lastInsertRowid as number;

      const insertAnswer = db.prepare('INSERT INTO answers (response_id, question_id, value) VALUES (?, ?, ?)');

      for (const [qid, value] of answerMap.entries()) {
        insertAnswer.run(responseId, qid, value);
      }

      return responseId;
    });

    const responseId = tx();
    return NextResponse.json({ ok: true, response_id: responseId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit response', detail: String(error) }, { status: 500 });
  }
}
