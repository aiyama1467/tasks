import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">ページが見つかりません</h2>
      <p className="text-sm text-muted-foreground">
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      <Link
        href="/dashboard"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
      >
        ダッシュボードに戻る
      </Link>
    </div>
  );
}
