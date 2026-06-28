"use client";

import {
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  ExternalLink,
  ListTodo,
  MoreHorizontal,
} from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { markItemRead, toggleItemSaved } from "@/app/(app)/feeds/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FEED_SOURCE_TYPE_COLOR } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";

export type FeedItemData = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  author: string | null;
  publishedAt: string | null;
  isRead: boolean;
  isSaved: boolean;
  convertedToTaskId: string | null;
  convertedToBacklogId: string | null;
  sourceName: string;
  sourceType: string;
};

interface FeedItemCardProps {
  item: FeedItemData;
  onConvertToTask: (item: FeedItemData) => void;
  onConvertToBacklog: (item: FeedItemData) => void;
}

export function FeedItemCard({ item, onConvertToTask, onConvertToBacklog }: FeedItemCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = () => {
    startTransition(async () => {
      await markItemRead(item.id);
    });
  };

  const handleToggleSaved = () => {
    startTransition(async () => {
      await toggleItemSaved(item.id);
      toast.success(item.isSaved ? "保存を解除しました" : "保存しました");
    });
  };

  const isConverted = !!item.convertedToTaskId || !!item.convertedToBacklogId;

  return (
    <Card className={cn(isPending && "opacity-50", !item.isRead && "border-l-4 border-l-primary")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-start gap-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMarkRead}
                className={cn(
                  "text-sm font-medium hover:underline",
                  item.isRead && "text-muted-foreground",
                )}
              >
                {item.title}
              </a>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </div>

            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge
                variant="outline"
                className={cn("text-[10px]", FEED_SOURCE_TYPE_COLOR[item.sourceType])}
              >
                {item.sourceName}
              </Badge>
              {item.author && <span>{item.author}</span>}
              {item.publishedAt && <span>{formatRelativeTime(item.publishedAt)}</span>}
              {isConverted && (
                <Badge variant="secondary" className="text-[10px]">
                  {item.convertedToTaskId ? "タスクに変換済" : "バックログに変換済"}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleToggleSaved}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
              title={item.isSaved ? "保存を解除" : "保存"}
            >
              {item.isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!item.isRead && (
                  <DropdownMenuItem onClick={handleMarkRead}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    既読にする
                  </DropdownMenuItem>
                )}
                {!isConverted && (
                  <>
                    <DropdownMenuItem onClick={() => onConvertToTask(item)}>
                      <ListTodo className="mr-2 h-4 w-4" />
                      タスクに変換
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onConvertToBacklog(item)}>
                      <Bookmark className="mr-2 h-4 w-4" />
                      バックログに変換
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
