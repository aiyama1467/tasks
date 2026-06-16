import { Badge } from "@/components/ui/badge";
import type { LabelOption } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function LabelBadge({
  value,
  options,
  className,
}: {
  value: string;
  options: Record<string, LabelOption>;
  className?: string;
}) {
  const option = options[value];
  return (
    <Badge variant="outline" className={cn(option?.color, className)}>
      {option?.label ?? value}
    </Badge>
  );
}
