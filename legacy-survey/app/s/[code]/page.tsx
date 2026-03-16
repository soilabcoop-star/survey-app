import { notFound } from 'next/navigation';
import SurveyForm from '@/components/survey/SurveyForm';
import { getDb } from '@/lib/db';
import { initDb } from '@/lib/schema';
import { getQuestions } from '@/lib/stats';

export default async function SurveyPage({ params }: { params: Promise<{ code: string }> }) {
  initDb();
  const { code } = await params;
  const db = getDb();

  const project = db.prepare('SELECT * FROM projects WHERE survey_code = ?').get(code) as
    | { id: number; name: string; description: string; survey_code: string }
    | undefined;

  if (!project) return notFound();

  const questions = getQuestions(project.id);

  return (
    <div>
      <SurveyForm
        surveyCode={project.survey_code}
        projectName={project.name}
        description={project.description}
        questions={questions}
      />
    </div>
  );
}
