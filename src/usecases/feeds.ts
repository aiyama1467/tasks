import { and, count, desc, eq, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { backlogItems, feedItems, feedSources, tasks } from "@/db/schema";
import { fetchFeed } from "@/lib/rss-fetcher";

// --- Feed Sources ---

export async function getFeedSources(userId: string) {
  return db.query.feedSources.findMany({
    where: eq(feedSources.userId, userId),
    orderBy: [desc(feedSources.createdAt)],
  });
}

export async function createFeedSource(
  userId: string,
  data: { name: string; url: string; sourceType?: string },
) {
  await db.insert(feedSources).values({
    userId,
    name: data.name,
    url: data.url,
    sourceType: data.sourceType || "rss",
  });
}

export async function updateFeedSource(
  userId: string,
  id: string,
  data: { name?: string; url?: string; sourceType?: string; enabled?: boolean },
) {
  await db
    .update(feedSources)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(feedSources.id, id), eq(feedSources.userId, userId)));
}

export async function deleteFeedSource(userId: string, id: string) {
  await db.delete(feedSources).where(and(eq(feedSources.id, id), eq(feedSources.userId, userId)));
}

// --- Feed Items ---

export async function getFeedItems(
  userId: string,
  filters?: { sourceId?: string; isRead?: boolean; isSaved?: boolean },
  limit = 50,
  offset = 0,
) {
  const conditions = [eq(feedItems.userId, userId)];
  if (filters?.sourceId) {
    conditions.push(eq(feedItems.sourceId, filters.sourceId));
  }
  if (filters?.isRead !== undefined) {
    conditions.push(eq(feedItems.isRead, filters.isRead));
  }
  if (filters?.isSaved !== undefined) {
    conditions.push(eq(feedItems.isSaved, filters.isSaved));
  }

  return db.query.feedItems.findMany({
    where: and(...conditions),
    with: { source: { columns: { name: true, sourceType: true } } },
    orderBy: [desc(feedItems.publishedAt), desc(feedItems.createdAt)],
    limit,
    offset,
  });
}

export async function getUnreadFeedItemCount(userId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(feedItems)
    .where(and(eq(feedItems.userId, userId), eq(feedItems.isRead, false)));
  return result.value;
}

export async function getRecentUnreadFeedItems(userId: string, limit = 5) {
  return db.query.feedItems.findMany({
    where: and(eq(feedItems.userId, userId), eq(feedItems.isRead, false)),
    with: { source: { columns: { name: true, sourceType: true } } },
    orderBy: [desc(feedItems.publishedAt), desc(feedItems.createdAt)],
    limit,
  });
}

// --- Refresh ---

export async function refreshFeedSource(userId: string, sourceId: string) {
  const source = await db.query.feedSources.findFirst({
    where: and(eq(feedSources.id, sourceId), eq(feedSources.userId, userId)),
  });
  if (!source?.enabled) return;

  try {
    const entries = await fetchFeed(source.url);

    if (entries.length > 0) {
      const existingUrls = new Set(
        (
          await db.query.feedItems.findMany({
            where: and(eq(feedItems.userId, userId), eq(feedItems.sourceId, sourceId)),
            columns: { url: true },
          })
        ).map((item) => item.url),
      );

      const newEntries = entries.filter((entry) => !existingUrls.has(entry.url));

      if (newEntries.length > 0) {
        await db.insert(feedItems).values(
          newEntries.map((entry) => ({
            userId,
            sourceId,
            title: entry.title,
            description: entry.description,
            url: entry.url,
            author: entry.author,
            thumbnailUrl: entry.thumbnailUrl,
            publishedAt: entry.publishedAt,
          })),
        );
      }
    }

    await db
      .update(feedSources)
      .set({ lastFetchedAt: new Date(), fetchError: null, updatedAt: new Date() })
      .where(eq(feedSources.id, sourceId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "取得に失敗しました";
    await db
      .update(feedSources)
      .set({ fetchError: message, updatedAt: new Date() })
      .where(eq(feedSources.id, sourceId));
    throw error;
  }
}

export async function refreshAllFeeds(userId: string) {
  const sources = await db.query.feedSources.findMany({
    where: and(eq(feedSources.userId, userId), eq(feedSources.enabled, true)),
  });

  const results: { sourceId: string; name: string; error?: string }[] = [];

  for (const source of sources) {
    try {
      await refreshFeedSource(userId, source.id);
      results.push({ sourceId: source.id, name: source.name });
    } catch (error) {
      results.push({
        sourceId: source.id,
        name: source.name,
        error: error instanceof Error ? error.message : "不明なエラー",
      });
    }
  }

  await deleteOldFeedItems(userId, 30);

  return results;
}

// --- Item Actions ---

export async function markFeedItemRead(userId: string, id: string) {
  await db
    .update(feedItems)
    .set({ isRead: true })
    .where(and(eq(feedItems.id, id), eq(feedItems.userId, userId)));
}

export async function markAllRead(userId: string, sourceId?: string) {
  const conditions = [eq(feedItems.userId, userId), eq(feedItems.isRead, false)];
  if (sourceId) {
    conditions.push(eq(feedItems.sourceId, sourceId));
  }
  await db
    .update(feedItems)
    .set({ isRead: true })
    .where(and(...conditions));
}

export async function toggleSaved(userId: string, id: string) {
  const item = await db.query.feedItems.findFirst({
    where: and(eq(feedItems.id, id), eq(feedItems.userId, userId)),
    columns: { isSaved: true },
  });
  if (!item) return;

  await db
    .update(feedItems)
    .set({ isSaved: !item.isSaved })
    .where(and(eq(feedItems.id, id), eq(feedItems.userId, userId)));
}

export async function convertToTask(
  userId: string,
  feedItemId: string,
  taskData: {
    title: string;
    description?: string;
    priority?: string;
    projectId?: string;
    dueDate?: string;
  },
) {
  const [newTask] = await db
    .insert(tasks)
    .values({
      userId,
      title: taskData.title,
      description: taskData.description || null,
      priority: taskData.priority || "medium",
      projectId: taskData.projectId || null,
      dueDate: taskData.dueDate || null,
    })
    .returning({ id: tasks.id });

  await db
    .update(feedItems)
    .set({ convertedToTaskId: newTask.id, isRead: true })
    .where(and(eq(feedItems.id, feedItemId), eq(feedItems.userId, userId)));

  return newTask.id;
}

export async function convertToBacklogItem(
  userId: string,
  feedItemId: string,
  backlogData: {
    title: string;
    description?: string;
    categoryId: string;
    priority?: string;
    url?: string;
  },
) {
  const [newBacklog] = await db
    .insert(backlogItems)
    .values({
      userId,
      title: backlogData.title,
      description: backlogData.description || null,
      categoryId: backlogData.categoryId,
      priority: backlogData.priority || "medium",
      url: backlogData.url || null,
    })
    .returning({ id: backlogItems.id });

  await db
    .update(feedItems)
    .set({ convertedToBacklogId: newBacklog.id, isRead: true })
    .where(and(eq(feedItems.id, feedItemId), eq(feedItems.userId, userId)));

  return newBacklog.id;
}

export async function deleteFeedItem(userId: string, id: string) {
  await db.delete(feedItems).where(and(eq(feedItems.id, id), eq(feedItems.userId, userId)));
}

export async function deleteOldFeedItems(userId: string, olderThanDays: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  await db
    .delete(feedItems)
    .where(
      and(
        eq(feedItems.userId, userId),
        lt(feedItems.createdAt, cutoff),
        eq(feedItems.isSaved, false),
        isNull(feedItems.convertedToTaskId),
        isNull(feedItems.convertedToBacklogId),
      ),
    );
}
