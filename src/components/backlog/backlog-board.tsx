"use client";

import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BACKLOG_STATUS } from "@/lib/constants";
import { BacklogItemCard } from "./backlog-item-card";
import { type BacklogItemData, BacklogItemForm } from "./backlog-item-form";
import { BacklogStatusSelect } from "./backlog-status-select";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface BacklogBoardProps {
  categories: Category[];
  items: BacklogItemData[];
  activeCategory: string;
}

export function BacklogBoard({ categories, items, activeCategory }: BacklogBoardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BacklogItemData | null>(null);

  // ステータスのデフォルトは「未完了」(完了を除く)。パラメータ無しで表現する。
  const statusFilter = searchParams.get("status") ?? "active";

  const handleTabChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", categoryId);
    router.push(`/backlog?${params.toString()}`);
  };

  const handleStatusFilter = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "active") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.push(`/backlog?${params.toString()}`);
  };

  const filteredItems = items.filter((item) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return item.status !== "completed";
    return item.status === statusFilter;
  });

  const itemsByCategory = categories.reduce(
    (acc, c) => {
      acc[c.id] = filteredItems.filter((i) => i.categoryId === c.id);
      return acc;
    },
    {} as Record<string, BacklogItemData[]>,
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BacklogStatusSelect
            filterMode
            value={statusFilter}
            onValueChange={handleStatusFilter}
            placeholder="ステータス"
            triggerClassName="w-32"
          />
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規アイテム
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={handleTabChange}>
        <TabsList>
          {categories.map((c) => {
            const count = items.filter((i) => i.categoryId === c.id).length;
            return (
              <TabsTrigger key={c.id} value={c.id}>
                {c.name}
                {count > 0 && (
                  <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((c) => (
          <TabsContent key={c.id} value={c.id} className="space-y-3 mt-4">
            {(itemsByCategory[c.id] ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">
                  {statusFilter in BACKLOG_STATUS
                    ? `「${BACKLOG_STATUS[statusFilter as keyof typeof BACKLOG_STATUS]}」のアイテムはありません`
                    : `${c.name}のアイテムはありません`}
                </p>
              </div>
            ) : (
              (itemsByCategory[c.id] ?? []).map((item) => (
                <BacklogItemCard key={item.id} item={item} onEdit={setEditingItem} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      <BacklogItemForm
        open={showForm}
        onOpenChange={setShowForm}
        categories={categories}
        defaultCategoryId={activeCategory}
      />

      <BacklogItemForm
        open={editingItem !== null}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        categories={categories}
      />
    </>
  );
}
