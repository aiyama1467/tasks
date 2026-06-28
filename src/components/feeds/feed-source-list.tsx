"use client";

import { AlertCircle, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteFeedSource, refreshFeeds, updateFeedSource } from "@/app/(app)/feeds/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FEED_SOURCE_TYPE, FEED_SOURCE_TYPE_COLOR } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { type FeedSourceData, FeedSourceForm } from "./feed-source-form";

interface FeedSourceListProps {
  sources: FeedSourceData[];
  activeSourceId?: string;
}

export function FeedSourceList({ sources, activeSourceId }: FeedSourceListProps) {
  const [isPending, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<FeedSourceData | null>(null);

  const handleRefreshAll = () => {
    startTransition(async () => {
      try {
        await refreshFeeds();
        toast.success("フィードを更新しました");
      } catch {
        toast.error("フィードの更新に失敗しました");
      }
    });
  };

  const handleToggleEnabled = (source: FeedSourceData) => {
    startTransition(async () => {
      await updateFeedSource(source.id, { enabled: !source.enabled });
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteFeedSource(id);
      toast.success("ソースを削除しました");
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditingSource(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          追加
        </Button>
        <Button size="sm" variant="outline" onClick={handleRefreshAll} disabled={isPending}>
          <RefreshCw className={cn("mr-1 h-4 w-4", isPending && "animate-spin")} />
          全更新
        </Button>
      </div>

      <div className="space-y-1">
        <Link
          href="/feeds"
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            !activeSourceId
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          すべてのソース
        </Link>
        {sources.map((source) => (
          <div
            key={source.id}
            className={cn(
              "group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              activeSourceId === source.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              !source.enabled && "opacity-50",
            )}
          >
            <Link
              href={`/feeds?source=${source.id}`}
              className="flex flex-1 items-center gap-2 text-left"
            >
              <span className="truncate">{source.name}</span>
              <Badge
                variant="outline"
                className={cn("shrink-0 text-[10px]", FEED_SOURCE_TYPE_COLOR[source.sourceType])}
              >
                {FEED_SOURCE_TYPE[source.sourceType as keyof typeof FEED_SOURCE_TYPE] ||
                  source.sourceType}
              </Badge>
            </Link>
            {(source as unknown as { fetchError?: string }).fetchError && (
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
            )}
            <div className="hidden shrink-0 gap-1 group-hover:flex">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleEnabled(source);
                }}
                className="rounded p-0.5 hover:bg-accent"
                title={source.enabled ? "無効化" : "有効化"}
              >
                <span className="text-xs">{source.enabled ? "ON" : "OFF"}</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSource(source);
                  setFormOpen(true);
                }}
                className="rounded p-0.5 hover:bg-accent"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(source.id);
                }}
                className="rounded p-0.5 text-destructive hover:bg-accent"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <FeedSourceForm open={formOpen} onOpenChange={setFormOpen} source={editingSource} />
    </div>
  );
}
