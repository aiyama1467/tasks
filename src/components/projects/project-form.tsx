"use client";

import { useTransition } from "react";
import { toast } from "sonner";
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
import { PROJECT_STATUS } from "@/lib/constants";
import { createProject, updateProject } from "@/app/projects/actions";

const PROJECT_COLORS = [
  { value: "blue", label: "青", class: "bg-blue-500" },
  { value: "green", label: "緑", class: "bg-green-500" },
  { value: "purple", label: "紫", class: "bg-purple-500" },
  { value: "orange", label: "橙", class: "bg-orange-500" },
  { value: "red", label: "赤", class: "bg-red-500" },
  { value: "pink", label: "桃", class: "bg-pink-500" },
];

export type ProjectData = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string | null;
};

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectData | null;
}

export function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!project;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      status: formData.get("status") as string,
      color: (formData.get("color") as string) || undefined,
    };

    startTransition(async () => {
      if (isEditing) {
        await updateProject(project.id, data);
      } else {
        await createProject(data);
      }
      toast.success(isEditing ? "プロジェクトを更新しました" : "プロジェクトを作成しました");
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "プロジェクトを編集" : "新規プロジェクト"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              プロジェクト名 <span className="text-destructive">*</span>
            </label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={project?.name ?? ""}
              placeholder="プロジェクト名を入力"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              説明
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description ?? ""}
              placeholder="説明を入力（任意）"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                ステータス
              </label>
              <Select
                name="status"
                defaultValue={project?.status ?? "active"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="color" className="text-sm font-medium">
                カラー
              </label>
              <Select
                name="color"
                defaultValue={project?.color ?? "blue"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_COLORS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-block h-3 w-3 rounded-full ${c.class}`}
                        />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
