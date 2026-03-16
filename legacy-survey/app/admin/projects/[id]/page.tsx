import ProjectDetailClient from '@/components/survey/ProjectDetailClient';

export default async function AdminProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailClient projectId={Number(id)} />;
}
