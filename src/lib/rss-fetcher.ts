import Parser from "rss-parser";

export type FeedEntry = {
  title: string;
  url: string;
  description: string | null;
  author: string | null;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
};

const parser = new Parser({
  timeout: 10_000,
  headers: {
    Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
  },
});

export async function fetchFeed(feedUrl: string): Promise<FeedEntry[]> {
  const feed = await parser.parseURL(feedUrl);

  return feed.items
    .map((item) => ({
      title: item.title?.trim() || item.link || "Untitled",
      url: item.link || "",
      description: item.contentSnippet?.slice(0, 500) || item.content?.slice(0, 500) || null,
      author: item.creator || item.author || null,
      thumbnailUrl: extractThumbnail(item) || null,
      publishedAt: item.pubDate
        ? new Date(item.pubDate)
        : item.isoDate
          ? new Date(item.isoDate)
          : null,
    }))
    .filter((entry) => entry.url !== "");
}

type MediaItem = Parser.Item & {
  "media:thumbnail"?: { $?: { url?: string } };
  "media:content"?: { $?: { url?: string } };
};

function extractThumbnail(item: Parser.Item): string | null {
  const media = item as MediaItem;
  try {
    const thumb = media?.["media:thumbnail"]?.$?.url;
    if (typeof thumb === "string") return thumb;

    const content = media?.["media:content"]?.$?.url;
    if (typeof content === "string" && /\.(jpg|jpeg|png|gif|webp)/i.test(content)) return content;
  } catch {
    // ignore malformed media fields
  }
  return null;
}
