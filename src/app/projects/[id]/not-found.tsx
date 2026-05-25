import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">プロジェクトが見つかりません</h2>
      <p className="text-sm text-muted-foreground">
        このプロジェクトは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/projects"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
      >
        プロジェクト一覧に戻る
      </Link>
    </div>
  );
}
