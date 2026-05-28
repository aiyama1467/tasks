"use client";

import { ExternalLink, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteBacklogItem, updateBacklogItemStatus } from "@/app/(app)/backlog/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BACKLOG_PRIORITY, BACKLOG_STATUS } from "@/lib/constants";
import type { BacklogItemData } from "./backlog-item-form";

interface BacklogItemCardProps {
  item: BacklogItemData;
  onEdit: (item: BacklogItemData) => void;
}

export function BacklogItemCard({ item, onEdit }: BacklogItemCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus) return;
    startTransition(() => {
      updateBacklogItemStatus(item.id, newStatus);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteBacklogItem(item.id);
      toast.success("アイテムを削除しました");
    });
  };

  return (
    <Card className={isPending ? "opacity-50" : ""}>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{item.title}</span>
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
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  編集
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
          )}

          <div className="flex items-center gap-2">
            <Select value={item.status} onValueChange={handleStatusChange} items={BACKLOG_STATUS}>
              <SelectTrigger className="h-7 w-24 text-xs">
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

            <Badge variant="outline" className="text-xs">
              {BACKLOG_PRIORITY[item.priority as keyof typeof BACKLOG_PRIORITY]}
            </Badge>

            {item.rating && (
              <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                <Star className="h-3 w-3 fill-current" />
                {item.rating}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
