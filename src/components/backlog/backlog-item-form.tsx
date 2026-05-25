"use client";

import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BACKLOG_STATUS, BACKLOG_PRIORITY } from "@/lib/constants";
import {
  createBacklogItem,
  updateBacklogItem,
} from "@/app/backlog/actions";

export type BacklogItemData = {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  status: string;
  priority: string;
  rating: number | null;
  url: string | null;
};

interface BacklogItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: BacklogItemData | null;
  categories: { id: string; name: string }[];
  defaultCategoryId?: string;
}

export function BacklogItemForm({
  open,
  onOpenChange,
  item,
  categories,
  defaultCategoryId,
}: BacklogItemFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!item;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const ratingStr = formData.get("rating") as string;

    startTransition(async () => {
      if (isEditing) {
        await updateBacklogItem(item.id, {
          title: formData.get("title") as string,
          description: (formData.get("description") as string) || undefined,
          categoryId: formData.get("categoryId") as string,
          status: formData.get("status") as string,
          priority: formData.get("priority") as string,
          rating: ratingStr ? parseInt(ratingStr) : null,
          url: (formData.get("url") as string) || null,
        });
      } else {
        await createBacklogItem({
          title: formData.get("title") as string,
          description: (formData.get("description") as string) || undefined,
          categoryId: formData.get("categoryId") as string,
          status: formData.get("status") as string,
          priority: formData.get("priority") as string,
          url: (formData.get("url") as string) || undefined,
        });
      }
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "アイテムを編集" : "新規アイテム"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              タイトル <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={item?.title ?? ""}
              placeholder="タイトルを入力"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              メモ
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item?.description ?? ""}
              placeholder="メモ・感想（任意）"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                カテゴリ
              </label>
              <Select
                name="categoryId"
                defaultValue={
                  item?.categoryId ?? defaultCategoryId ?? categories[0]?.id
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                ステータス
              </label>
              <Select
                name="status"
                defaultValue={item?.status ?? "not_started"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BACKLOG_STATUS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                優先度
              </label>
              <Select
                name="priority"
                defaultValue={item?.priority ?? "medium"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BACKLOG_PRIORITY).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditing && item?.status === "completed" && (
              <div className="space-y-2">
                <label htmlFor="rating" className="text-sm font-medium">
                  評価 (1-5)
                </label>
                <Select
                  name="rating"
                  defaultValue={item?.rating?.toString() ?? ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="未評価" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {"★".repeat(n)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              URL
            </label>
            <Input
              id="url"
              name="url"
              type="url"
              defaultValue={item?.url ?? ""}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : isEditing ? "更新" : "作成"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
