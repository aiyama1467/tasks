"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { convertItemToBacklogItem, convertItemToTask } from "@/app/(app)/feeds/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BACKLOG_PRIORITY, TASK_PRIORITY } from "@/lib/constants";
import type { FeedItemData } from "./feed-item-card";

interface ConvertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FeedItemData | null;
  projects: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function ConvertDialog({
  open,
  onOpenChange,
  item,
  projects,
  categories,
}: ConvertDialogProps) {
  const [isPending, startTransition] = useTransition();

  if (!item) return null;

  const handleTaskSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      await convertItemToTask(item.id, {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        priority: formData.get("priority") as string,
        projectId: (formData.get("projectId") as string) || undefined,
        dueDate: (formData.get("dueDate") as string) || undefined,
      });
      toast.success("タスクに変換しました");
      onOpenChange(false);
    });
  };

  const handleBacklogSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      await convertItemToBacklogItem(item.id, {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        categoryId: formData.get("categoryId") as string,
        priority: formData.get("priority") as string,
        url: (formData.get("url") as string) || undefined,
      });
      toast.success("バックログに変換しました");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>フィードアイテムを変換</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="task">
          <TabsList className="w-full">
            <TabsTrigger value="task" className="flex-1">
              タスク
            </TabsTrigger>
            <TabsTrigger value="backlog" className="flex-1">
              バックログ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="task">
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="task-title" className="text-sm font-medium">
                  タイトル
                </label>
                <Input id="task-title" name="title" required defaultValue={item.title} />
              </div>
              <div className="space-y-2">
                <label htmlFor="task-description" className="text-sm font-medium">
                  説明
                </label>
                <Textarea
                  id="task-description"
                  name="description"
                  defaultValue={item.description ?? ""}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="task-priority" className="text-sm font-medium">
                    優先度
                  </label>
                  <Select name="priority" defaultValue="medium" items={TASK_PRIORITY}>
                    <SelectTrigger id="task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_PRIORITY).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {projects.length > 0 && (
                  <div className="space-y-2">
                    <label htmlFor="task-projectId" className="text-sm font-medium">
                      プロジェクト
                    </label>
                    <Select name="projectId" defaultValue="">
                      <SelectTrigger id="task-projectId">
                        <SelectValue placeholder="なし" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="task-dueDate" className="text-sm font-medium">
                  期限
                </label>
                <Input id="task-dueDate" name="dueDate" type="date" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "変換中..." : "タスクに変換"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="backlog">
            <form onSubmit={handleBacklogSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="backlog-title" className="text-sm font-medium">
                  タイトル
                </label>
                <Input id="backlog-title" name="title" required defaultValue={item.title} />
              </div>
              <div className="space-y-2">
                <label htmlFor="backlog-description" className="text-sm font-medium">
                  メモ
                </label>
                <Textarea
                  id="backlog-description"
                  name="description"
                  defaultValue={item.description ?? ""}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="backlog-categoryId" className="text-sm font-medium">
                    カテゴリ
                  </label>
                  <Select
                    name="categoryId"
                    defaultValue={categories[0]?.id}
                    items={categories.map((c) => ({ value: c.id, label: c.name }))}
                  >
                    <SelectTrigger id="backlog-categoryId">
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
                  <label htmlFor="backlog-priority" className="text-sm font-medium">
                    優先度
                  </label>
                  <Select name="priority" defaultValue="medium" items={BACKLOG_PRIORITY}>
                    <SelectTrigger id="backlog-priority">
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
              </div>
              <div className="space-y-2">
                <label htmlFor="backlog-url" className="text-sm font-medium">
                  URL
                </label>
                <Input id="backlog-url" name="url" type="url" defaultValue={item.url} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "変換中..." : "バックログに変換"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
