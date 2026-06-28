"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { addFeedSource, updateFeedSource } from "@/app/(app)/feeds/actions";
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
import { FEED_SOURCE_TYPE } from "@/lib/constants";

export type FeedSourceData = {
  id: string;
  name: string;
  url: string;
  sourceType: string;
  enabled: boolean;
};

interface FeedSourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: FeedSourceData | null;
}

export function FeedSourceForm({ open, onOpenChange, source }: FeedSourceFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!source;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      if (isEditing) {
        await updateFeedSource(source.id, {
          name: formData.get("name") as string,
          url: formData.get("url") as string,
          sourceType: formData.get("sourceType") as string,
        });
      } else {
        await addFeedSource({
          name: formData.get("name") as string,
          url: formData.get("url") as string,
          sourceType: formData.get("sourceType") as string,
        });
      }
      toast.success(isEditing ? "ソースを更新しました" : "ソースを追加しました");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "ソースを編集" : "フィードソースを追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              名前 <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={source?.name ?? ""}
              placeholder="例: Hacker News"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="sourceType" className="text-sm font-medium">
              ソースタイプ
            </label>
            <Select
              name="sourceType"
              defaultValue={source?.sourceType ?? "rss"}
              items={FEED_SOURCE_TYPE}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FEED_SOURCE_TYPE).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium">
              フィード URL <span className="text-destructive">*</span>
            </label>
            <Input
              id="url"
              name="url"
              type="url"
              required
              defaultValue={source?.url ?? ""}
              placeholder="https://example.com/feed.xml"
            />
            <p className="text-xs text-muted-foreground">
              Twitter の場合: RSSHub（例: https://rsshub.app/twitter/user/ユーザー名）や Nitter の
              RSS URL を入力してください
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "保存中..." : isEditing ? "更新" : "追加"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
