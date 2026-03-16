export type ProjectCategory = 'livinglab' | 'workshop' | 'consulting' | 'education' | 'other';

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  livinglab: '리빙랩',
  workshop: '워크숍',
  consulting: '컨설팅',
  education: '교육',
  other: '기타',
};

export type ProjectStatus = 'draft' | 'active' | 'closed';

export interface Project {
  id: number;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  survey_code: string;
  created_at: string;
  closed_at: string | null;
  response_count?: number;
  avg_overall?: number | null;
}

export type QuestionType = 'likert5' | 'likert10' | 'multiple' | 'checkbox' | 'text' | 'textarea';

export interface Question {
  id: number;
  project_id: number;
  order_index: number;
  type: QuestionType;
  text: string;
  options: string | null;
  required: boolean;
  is_overall: boolean;
}

export interface SurveyResponse {
  id: number;
  project_id: number;
  session_id: string;
  submitted_at: string;
}

export interface Answer {
  id: number;
  response_id: number;
  question_id: number;
  value: string;
}

export interface QuestionStat {
  question_id: number;
  question_text: string;
  question_type: QuestionType;
  is_overall: boolean;
  avg_score: number | null;
  distribution: Record<string, number>;
  text_answers: string[];
}

export interface ProjectStat {
  project: Project;
  total_responses: number;
  avg_overall: number | null;
  question_stats: QuestionStat[];
}

export interface CategoryStat {
  category: ProjectCategory;
  project_count: number;
  total_responses: number;
  avg_overall: number | null;
  projects: { id: number; name: string; avg_overall: number | null; response_count: number }[];
  trend: { period: string; avg: number }[];
}

export interface ProjectWithStats extends Project {
  response_count: number;
  avg_overall: number | null;
}
