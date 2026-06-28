import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ja });
  } catch {
    return "";
  }
}
