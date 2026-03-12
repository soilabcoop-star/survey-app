import { getDb } from '@/lib/db';
import { initDb } from '@/lib/schema';
import { CategoryStat, ProjectCategory, ProjectStat, ProjectWithStats, Question, QuestionStat } from '@/lib/types';

const LIKERT_TYPES = new Set(['likert5', 'likert10']);

export function toBool(input: unknown) {
  return input === 1 || input === '1' || input === true;
}

export function getProjectsWithStats(): ProjectWithStats[] {
  initDb();
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT
        p.*,
        COUNT(DISTINCT sr.id) AS response_count,
        ROUND(AVG(CASE WHEN q.is_overall = 1 THEN CAST(a.value AS REAL) END), 2) AS avg_overall
      FROM projects p
      LEFT JOIN survey_responses sr ON sr.project_id = p.id
      LEFT JOIN answers a ON a.response_id = sr.id
      LEFT JOIN questions q ON q.id = a.question_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
    )
    .all() as ProjectWithStats[];

  return rows.map((r) => ({ ...r, avg_overall: r.avg_overall === null ? null : Number(r.avg_overall) }));
}

export function getProjectByCode(code: string) {
  initDb();
  const db = getDb();
  return db.prepare('SELECT * FROM projects WHERE survey_code = ?').get(code);
}

export function getQuestions(projectId: number): Question[] {
  const db = getDb();
  type RawQuestion = Omit<Question, 'required' | 'is_overall'> & { required: number; is_overall: number };
  const rows = db
    .prepare('SELECT * FROM questions WHERE project_id = ? ORDER BY order_index ASC, id ASC')
    .all(projectId) as RawQuestion[];
  return rows.map((q) => ({ ...q, required: toBool(q.required), is_overall: toBool(q.is_overall) }));
}

export function getProjectStat(projectId: number): ProjectStat | null {
  initDb();
  const db = getDb();
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  if (!project) return null;

  const questions = getQuestions(projectId);
  const totalRow = db.prepare('SELECT COUNT(*) as c FROM survey_responses WHERE project_id = ?').get(projectId) as
    | { c: number }
    | undefined;
  const totalResponses = Number(totalRow?.c ?? 0);

  const avgOverall = db
    .prepare(
      `
      SELECT ROUND(AVG(CAST(a.value AS REAL)), 2) as avg
      FROM answers a
      JOIN questions q ON q.id = a.question_id
      JOIN survey_responses sr ON sr.id = a.response_id
      WHERE q.project_id = ? AND q.is_overall = 1
    `,
    )
    .get(projectId) as { avg: number | null };

  const questionStats: QuestionStat[] = questions.map((q) => {
    const answerRows = db
      .prepare(
        `
        SELECT a.value
        FROM answers a
        JOIN survey_responses sr ON sr.id = a.response_id
        WHERE sr.project_id = ? AND a.question_id = ?
      `,
      )
      .all(projectId, q.id) as { value: string }[];

    const distribution: Record<string, number> = {};
    const textAnswers: string[] = [];
    let sum = 0;
    let count = 0;

    for (const row of answerRows) {
      const value = row.value;
      distribution[value] = (distribution[value] ?? 0) + 1;
      if (LIKERT_TYPES.has(q.type)) {
        const n = Number(value);
        if (!Number.isNaN(n)) {
          sum += n;
          count += 1;
        }
      }
      if (q.type === 'text' || q.type === 'textarea') {
        textAnswers.push(value);
      }
    }

    return {
      question_id: q.id,
      question_text: q.text,
      question_type: q.type,
      is_overall: q.is_overall,
      avg_score: LIKERT_TYPES.has(q.type) ? (count > 0 ? Number((sum / count).toFixed(2)) : null) : null,
      distribution,
      text_answers: textAnswers,
    };
  });

  return {
    project,
    total_responses: totalResponses,
    avg_overall: avgOverall.avg === null ? null : Number(avgOverall.avg),
    question_stats: questionStats,
  };
}

export function getCategoryStats(): CategoryStat[] {
  initDb();
  const db = getDb();
  const categories: ProjectCategory[] = ['livinglab', 'workshop', 'consulting', 'education', 'other'];
  const stats: CategoryStat[] = [];

  for (const category of categories) {
    const projects = db
      .prepare(
        `
        SELECT
          p.id,
          p.name,
          COUNT(DISTINCT sr.id) AS response_count,
          ROUND(AVG(CASE WHEN q.is_overall = 1 THEN CAST(a.value AS REAL) END), 2) AS avg_overall
        FROM projects p
        LEFT JOIN survey_responses sr ON sr.project_id = p.id
        LEFT JOIN answers a ON a.response_id = sr.id
        LEFT JOIN questions q ON q.id = a.question_id
        WHERE p.category = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `,
      )
      .all(category) as { id: number; name: string; response_count: number; avg_overall: number | null }[];

    const trendRows = db
      .prepare(
        `
        SELECT
          strftime('%Y-%m', sr.submitted_at) as period,
          ROUND(AVG(CASE WHEN q.is_overall = 1 THEN CAST(a.value AS REAL) END), 2) as avg
        FROM survey_responses sr
        JOIN projects p ON p.id = sr.project_id
        JOIN answers a ON a.response_id = sr.id
        JOIN questions q ON q.id = a.question_id
        WHERE p.category = ?
        GROUP BY strftime('%Y-%m', sr.submitted_at)
        ORDER BY period ASC
      `,
      )
      .all(category) as { period: string; avg: number }[];

    const totalResponses = projects.reduce((acc, p) => acc + Number(p.response_count || 0), 0);
    const avgRows = projects.filter((p) => p.avg_overall !== null).map((p) => Number(p.avg_overall));

    stats.push({
      category,
      project_count: projects.length,
      total_responses: totalResponses,
      avg_overall: avgRows.length ? Number((avgRows.reduce((a, b) => a + b, 0) / avgRows.length).toFixed(2)) : null,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        avg_overall: p.avg_overall === null ? null : Number(p.avg_overall),
        response_count: Number(p.response_count || 0),
      })),
      trend: trendRows.map((t) => ({ period: t.period, avg: Number(t.avg) })),
    });
  }

  return stats;
}

export function createSurveyCode(category: ProjectCategory) {
  const prefixMap: Record<ProjectCategory, string> = {
    livinglab: 'LVL',
    workshop: 'WSP',
    education: 'EDU',
    consulting: 'CST',
    other: 'OTH',
  };
  const db = getDb();
  const prefix = prefixMap[category] ?? 'OTH';
  const row = db.prepare('SELECT COUNT(*) as c FROM projects WHERE survey_code LIKE ?').get(`${prefix}%`) as { c: number };
  return `${prefix}${String((row?.c ?? 0) + 1).padStart(3, '0')}`;
}

export function getRawResponses(projectId: number) {
  const db = getDb();
  const responses = db
    .prepare('SELECT * FROM survey_responses WHERE project_id = ? ORDER BY submitted_at DESC')
    .all(projectId) as { id: number; submitted_at: string }[];

  const answers = db
    .prepare(
      `
      SELECT a.response_id, a.question_id, a.value
      FROM answers a
      JOIN survey_responses sr ON sr.id = a.response_id
      WHERE sr.project_id = ?
    `,
    )
    .all(projectId) as { response_id: number; question_id: number; value: string }[];

  const answerMap: Record<number, Record<number, string>> = {};
  for (const a of answers) {
    if (!answerMap[a.response_id]) answerMap[a.response_id] = {};
    answerMap[a.response_id][a.question_id] = a.value;
  }

  return responses.map((r) => ({
    ...r,
    answers: answerMap[r.id] ?? {},
  }));
}
