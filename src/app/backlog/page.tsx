import { BacklogBoard } from "@/components/backlog/backlog-board";
import { BacklogStats } from "@/components/backlog/backlog-stats";
import { db } from "@/db";

export default async function BacklogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string }>;
}) {
  const params = await searchParams;

  const [categoryList, itemList] = await Promise.all([
    db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.position)],
    }),
    db.query.backlogItems.findMany({
      orderBy: (backlogItems, { desc }) => [desc(backlogItems.createdAt)],
    }),
  ]);

  const activeCategory = params.category ?? categoryList[0]?.id ?? "";

  const mappedItems = itemList.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    categoryId: item.categoryId,
    status: item.status,
    priority: item.priority,
    rating: item.rating,
    url: item.url,
  }));

  const stats = categoryList.map((c) => {
    const catItems = itemList.filter((i) => i.categoryId === c.id);
    return {
      name: c.name,
      total: catItems.length,
      completed: catItems.filter((i) => i.status === "completed").length,
    };
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">バックログ</h1>
      <BacklogStats stats={stats} />
      <BacklogBoard
        categories={categoryList.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
        }))}
        items={mappedItems}
        activeCategory={activeCategory}
      />
    </div>
  );
}
