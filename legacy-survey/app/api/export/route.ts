import { NextResponse } from 'next/server';
import { getQuestions, getRawResponses } from '@/lib/stats';

function escapeCsv(value: string) {
  const safe = String(value ?? '');
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = Number(url.searchParams.get('project_id'));

    if (!projectId) return NextResponse.json({ error: 'project_id is required' }, { status: 400 });

    const questions = getQuestions(projectId);
    const rows = getRawResponses(projectId);

    const header = ['응답ID', '제출일시', ...questions.map((q, idx) => `Q${idx + 1}`)];
    const csvRows = [header.map(escapeCsv).join(',')];

    for (const row of rows) {
      const values = [String(row.id), row.submitted_at, ...questions.map((q) => row.answers[q.id] ?? '')];
      csvRows.push(values.map(escapeCsv).join(','));
    }

    const csvText = `\uFEFF${csvRows.join('\n')}`;

    return new NextResponse(csvText, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8-sig',
        'Content-Disposition': `attachment; filename=project-${projectId}-responses.csv`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export CSV', detail: String(error) }, { status: 500 });
  }
}
