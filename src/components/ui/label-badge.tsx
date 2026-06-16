import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LabelBadge({
  value,
  labelMap,
  colorMap,
  className,
}: {
  value: string;
  labelMap: Record<string, string>;
  colorMap?: Record<string, string>;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(colorMap?.[value], className)}>
      {labelMap[value] ?? value}
    </Badge>
  );
}
