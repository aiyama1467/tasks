export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">プロジェクト詳細</h1>
      <p className="mt-2 text-muted-foreground">プロジェクトID: {id}</p>
    </div>
  );
}
