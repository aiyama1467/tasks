import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface BacklogSummary {
  id: string;
  title: string;
  categoryName: string;
  url: string | null;
}

export function InProgressBacklog({
  items,
}: {
  items: BacklogSummary[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">進行中のバックログ</CardTitle>
        <Link
          href="/backlog"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          すべて表示
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            進行中のアイテムはありません
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
            >
              <span className="flex-1 text-sm">{item.title}</span>
              <Badge variant="outline" className="text-xs">
                {item.categoryName}
              </Badge>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
