"use client";

import { CheckCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { markAllItemsRead } from "@/app/(app)/feeds/actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConvertDialog } from "./convert-dialog";
import { FeedItemCard, type FeedItemData } from "./feed-item-card";

interface FeedTimelineProps {
  items: FeedItemData[];
  projects: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  activeSourceId?: string;
}

type FilterTab = "all" | "unread" | "saved";

export function FeedTimeline({ items, projects, categories, activeSourceId }: FeedTimelineProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [convertItem, setConvertItem] = useState<FeedItemData | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);

  const filteredItems = items.filter((item) => {
    if (activeTab === "unread") return !item.isRead;
    if (activeTab === "saved") return item.isSaved;
    return true;
  });

  const unreadCount = items.filter((i) => !i.isRead).length;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllItemsRead(activeSourceId);
      toast.success("すべて既読にしました");
    });
  };

  const openConvert = (item: FeedItemData) => {
    setConvertItem(item);
    setConvertOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="unread">未読{unreadCount > 0 && ` (${unreadCount})`}</TabsTrigger>
            <TabsTrigger value="saved">保存済み</TabsTrigger>
          </TabsList>
        </Tabs>

        {unreadCount > 0 && (
          <Button size="sm" variant="ghost" onClick={handleMarkAllRead} disabled={isPending}>
            <CheckCheck className="mr-1 h-4 w-4" />
            全件既読
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {activeTab === "unread"
              ? "未読のアイテムはありません"
              : activeTab === "saved"
                ? "保存済みのアイテムはありません"
                : "フィードアイテムはありません。ソースを追加してリフレッシュしてください。"}
          </p>
        ) : (
          filteredItems.map((item) => (
            <FeedItemCard
              key={item.id}
              item={item}
              onConvertToTask={openConvert}
              onConvertToBacklog={openConvert}
            />
          ))
        )}
      </div>

      <ConvertDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        item={convertItem}
        projects={projects}
        categories={categories}
      />
    </div>
  );
}
