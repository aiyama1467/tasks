import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FeedSourceList } from "@/components/feeds/feed-source-list";
import { FeedTimeline } from "@/components/feeds/feed-timeline";
import { getCategories } from "@/usecases/backlog";
import { getFeedItems, getFeedSources } from "@/usecases/feeds";
import { getProjects } from "@/usecases/projects";

export default async function FeedsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; saved?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const activeSourceId = params.source;

  const [sources, items, projectList, categoryList] = await Promise.all([
    getFeedSources(userId),
    getFeedItems(userId, {
      sourceId: activeSourceId,
      isSaved: params.saved === "true" ? true : undefined,
    }),
    getProjects(userId),
    getCategories(),
  ]);

  const mappedSources = sources.map((s) => ({
    id: s.id,
    name: s.name,
    url: s.url,
    sourceType: s.sourceType,
    enabled: s.enabled,
  }));

  const mappedItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    url: item.url,
    author: item.author,
    publishedAt: item.publishedAt?.toISOString() ?? null,
    isRead: item.isRead,
    isSaved: item.isSaved,
    convertedToTaskId: item.convertedToTaskId,
    convertedToBacklogId: item.convertedToBacklogId,
    sourceName: item.source.name,
    sourceType: item.source.sourceType,
  }));

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">フィード</h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <FeedSourceList sources={mappedSources} activeSourceId={activeSourceId} />
        </aside>

        <main className="flex-1">
          <FeedTimeline
            items={mappedItems}
            projects={projectList.map((p) => ({ id: p.id, name: p.name }))}
            categories={categoryList.map((c) => ({ id: c.id, name: c.name }))}
            activeSourceId={activeSourceId}
          />
        </main>
      </div>
    </div>
  );
}
