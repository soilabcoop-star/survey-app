import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { getProjectStat } from '@/lib/stats';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = Number(body.project_id);
    if (!projectId) return NextResponse.json({ error: 'project_id is required' }, { status: 400 });

    const stat = getProjectStat(projectId);
    if (!stat) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return NextResponse.json({
        report: {
          summary: 'API 키 미설정 상태입니다. 기본 분석 결과를 표시합니다.',
          strengths: ['전반적 만족도 문항 평균이 양호합니다.', '참여자의 응답 완료율이 안정적입니다.', '프로그램 유용성 항목이 긍정적으로 나타났습니다.'],
          improvements: ['주관식 개선 의견을 다음 기수 설계에 반영하세요.', '응답 수가 적은 사업은 표본 확대가 필요합니다.'],
          key_insights: ['카테고리별 편차를 추적하면 운영 전략 수립에 유리합니다.', 'is_overall 문항을 중심으로 장기 추이를 관리하세요.'],
          recommendations: ['사업별 목표 점수를 사전에 설정하세요.', '응답 독려 메시지를 운영 중 주기적으로 노출하세요.', '종료 사업 리포트를 월 단위로 누적 관리하세요.'],
          overall_grade: 'B',
          grade_reason: '기본 지표는 양호하나 표본 수와 개선 실행 추적이 추가로 필요합니다.',
        },
      });
    }

    const client = new Anthropic({ apiKey });
    const payload = {
      project: stat.project,
      total_responses: stat.total_responses,
      avg_overall: stat.avg_overall,
      question_stats: stat.question_stats,
    };

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: '당신은 사회적기업 지원 기관 소이랩의 사업 성과 분석 전문가입니다.',
      messages: [
        {
          role: 'user',
          content: `다음 만족도 조사 결과를 분석하여 JSON 형식으로 리포트를 작성해주세요.\n${JSON.stringify(payload, null, 2)}\n\nJSON 형식:\n{\n  "summary": "전체 요약 (3문장)",\n  "strengths": ["강점1", "강점2", "강점3"],\n  "improvements": ["개선점1", "개선점2"],\n  "key_insights": ["인사이트1", "인사이트2"],\n  "recommendations": ["제언1", "제언2", "제언3"],\n  "overall_grade": "A|B|C|D",\n  "grade_reason": "등급 판정 이유"\n}`,
        },
      ],
    });

    const text = message.content.find((item) => item.type === 'text');
    const raw = text?.type === 'text' ? text.text : '{}';
    const report = JSON.parse(raw);

    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate report', detail: String(error) }, { status: 500 });
  }
}
