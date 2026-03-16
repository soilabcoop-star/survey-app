import { getDb } from './db';
import { initDb } from './schema';
import { ProjectCategory } from './types';

type SeedProject = {
  name: string;
  description: string;
  category: ProjectCategory;
  status: 'draft' | 'active' | 'closed';
  survey_code: string;
  responseCount: number;
  avgTarget: number;
};

const projects: SeedProject[] = [
  {
    name: '제대로리빙랩 2025',
    description: '사회문제 발굴 및 시민참여 리빙랩 프로그램',
    category: 'livinglab',
    status: 'closed',
    survey_code: 'LVL001',
    responseCount: 32,
    avgTarget: 4.2,
  },
  {
    name: '사회적기업 창업교육 워크숍',
    description: '초기 창업팀을 위한 실습형 워크숍',
    category: 'workshop',
    status: 'closed',
    survey_code: 'WSP002',
    responseCount: 18,
    avgTarget: 3.9,
  },
  {
    name: '청년 사회혁신가 육성 프로그램',
    description: '청년 대상 사회혁신 프로젝트 교육 과정',
    category: 'education',
    status: 'active',
    survey_code: 'EDU003',
    responseCount: 11,
    avgTarget: 4.5,
  },
  {
    name: '사회적경제 조직 컨설팅',
    description: '조직 운영 및 임팩트 측정 컨설팅 지원',
    category: 'consulting',
    status: 'active',
    survey_code: 'CST004',
    responseCount: 6,
    avgTarget: 4.1,
  },
  {
    name: '지역문제 발굴 리빙랩 2026',
    description: '신규 리빙랩 파일럿 프로그램',
    category: 'livinglab',
    status: 'active',
    survey_code: 'LVL005',
    responseCount: 0,
    avgTarget: 4.0,
  },
];

const baseQuestions = [
  { type: 'likert5', text: '이번 프로그램 전반적 만족도는?', required: 1, is_overall: 1 },
  { type: 'likert5', text: '프로그램 내용의 유용성은?', required: 1, is_overall: 0 },
  { type: 'likert5', text: '운영 및 진행 방식에 대한 만족도는?', required: 1, is_overall: 0 },
  { type: 'likert5', text: '강사/퍼실리테이터의 전문성은?', required: 1, is_overall: 0 },
  {
    type: 'multiple',
    text: '다음에도 참여할 의향이 있으신가요?',
    options: JSON.stringify(['매우 그렇다', '그렇다', '보통', '그렇지 않다']),
    required: 1,
    is_overall: 0,
  },
  {
    type: 'multiple',
    text: '이 프로그램을 주변에 추천하시겠습니까?',
    options: JSON.stringify(['매우 그렇다', '그렇다', '보통', '그렇지 않다']),
    required: 1,
    is_overall: 0,
  },
  {
    type: 'checkbox',
    text: '참여 동기는 무엇이었나요?',
    options: JSON.stringify(['업무 필요', '자기계발', '지인 추천', '기관 홍보', '기타']),
    required: 1,
    is_overall: 0,
  },
  { type: 'textarea', text: '개선이 필요한 점이나 건의사항을 남겨주세요.', required: 0, is_overall: 0 },
];

const livingLabQuestions = [
  { type: 'likert5', text: '리빙랩 참여를 통해 지역 문제에 대한 이해가 높아졌나요?', required: 1, is_overall: 0 },
  { type: 'likert5', text: '시민 참여 방식이 적절했나요?', required: 1, is_overall: 0 },
];

const eduQuestions = [
  { type: 'likert5', text: '교육 내용이 실무에 적용 가능한가요?', required: 1, is_overall: 0 },
  { type: 'likert5', text: '교육 시간과 분량은 적절했나요?', required: 1, is_overall: 0 },
];

const textSamples = [
  '현장 사례가 많아서 좋았습니다.',
  '프로그램 운영이 체계적이었습니다.',
  '후속 심화 과정이 있으면 좋겠습니다.',
  '참여자 간 네트워킹 시간이 유익했습니다.',
  '실습 시간이 조금 더 길면 좋겠습니다.',
];

function randomLikert(center = 4) {
  const r = Math.random();
  if (r < 0.08) return Math.max(1, center - 2);
  if (r < 0.25) return Math.max(1, center - 1);
  if (r < 0.7) return center;
  if (r < 0.9) return Math.min(5, center + 1);
  return Math.min(5, center + 2);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function main() {
  initDb();
  const db = getDb();

  db.exec(`
    DELETE FROM answers;
    DELETE FROM survey_responses;
    DELETE FROM questions;
    DELETE FROM projects;
    DELETE FROM sqlite_sequence;
  `);

  const insertProject = db.prepare(
    `INSERT INTO projects (name, description, category, status, survey_code, created_at, closed_at)
     VALUES (?, ?, ?, ?, ?, datetime('now','localtime'), ?)`
  );
  const insertQuestion = db.prepare(
    `INSERT INTO questions (project_id, order_index, type, text, options, required, is_overall)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const insertResponse = db.prepare(
    `INSERT INTO survey_responses (project_id, session_id, submitted_at)
     VALUES (?, ?, datetime('now','localtime', ?))`
  );
  const insertAnswer = db.prepare(
    'INSERT INTO answers (response_id, question_id, value) VALUES (?, ?, ?)'
  );

  for (const seed of projects) {
    const closedAt = seed.status === 'closed' ? new Date().toISOString() : null;
    const p = insertProject.run(seed.name, seed.description, seed.category, seed.status, seed.survey_code, closedAt).lastInsertRowid as number;

    const extra = seed.category === 'livinglab' ? livingLabQuestions : seed.category === 'workshop' || seed.category === 'education' ? eduQuestions : [];
    const allQuestions = [...baseQuestions, ...extra];

    allQuestions.forEach((q, idx) => {
      insertQuestion.run(p, idx + 1, q.type, q.text, 'options' in q ? q.options : null, q.required, q.is_overall);
    });

    if (seed.responseCount === 0) continue;

    const qRows = db.prepare('SELECT * FROM questions WHERE project_id = ? ORDER BY order_index ASC').all(p) as any[];

    for (let i = 0; i < seed.responseCount; i += 1) {
      const daysAgo = `-${Math.floor(Math.random() * 120)} days`;
      const responseId = insertResponse.run(p, `seed-${seed.survey_code}-${i + 1}`, daysAgo).lastInsertRowid as number;

      for (const q of qRows) {
        if (q.type === 'likert5') {
          const center = Math.round(seed.avgTarget);
          insertAnswer.run(responseId, q.id, String(randomLikert(center)));
        } else if (q.type === 'likert10') {
          insertAnswer.run(responseId, q.id, String(Math.max(1, Math.min(10, randomLikert(8)))));
        } else if (q.type === 'multiple') {
          const options = JSON.parse(q.options ?? '[]');
          insertAnswer.run(responseId, q.id, pick(options));
        } else if (q.type === 'checkbox') {
          const options = JSON.parse(q.options ?? '[]');
          const count = Math.random() > 0.5 ? 2 : 1;
          const picked = [...options].sort(() => 0.5 - Math.random()).slice(0, count);
          insertAnswer.run(responseId, q.id, JSON.stringify(picked));
        } else {
          insertAnswer.run(responseId, q.id, pick(textSamples));
        }
      }
    }
  }

  console.log('Database seeded successfully.');
}

main();

