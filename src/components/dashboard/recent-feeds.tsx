import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FEED_SOURCE_TYPE_COLOR } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";

interface FeedSummary {
  id: string;
  title: string;
  url: string;
  publishedAt: string | null;
  sourceName: string;
  sourceType: string;
}

export function RecentFeeds({ items }: { items: FeedSummary[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">最新のフィード</CardTitle>
        <Link href="/feeds" className="text-sm text-muted-foreground hover:text-foreground">
          すべて表示
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            未読のフィードはありません
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
            >
              <span className="flex-1 truncate text-sm">{item.title}</span>
              <Badge
                variant="outline"
                className={cn("shrink-0 text-[10px]", FEED_SOURCE_TYPE_COLOR[item.sourceType])}
              >
                {item.sourceName}
              </Badge>
              {item.publishedAt && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(item.publishedAt)}
                </span>
              )}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
