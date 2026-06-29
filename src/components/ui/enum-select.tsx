"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnumSelectProps {
  /** value→ラベルのマップ。これをそのまま SelectItem 群に展開する。 */
  map: Record<string, string>;
  /** 先頭に「すべて」(value="all") を追加する。フィルタ用途。 */
  includeAll?: boolean;
  /** 制御コンポーネントとして使う場合の値 */
  value?: string;
  onValueChange?: (value: string | null) => void;
  /** フォーム送信（非制御）として使う場合 */
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  triggerClassName?: string;
}

/**
 * enum ラベルマップを渡すだけで Select 一式を描画する汎用コンポーネント。
 * アイコン付きの `TaskStatusSelect` のような特殊ケース以外はこれで済む。
 */
export function EnumSelect({
  map,
  includeAll = false,
  value,
  onValueChange,
  name,
  defaultValue,
  placeholder,
  triggerClassName,
}: EnumSelectProps) {
  const items: Record<string, string> = includeAll ? { all: "すべて", ...map } : map;

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      name={name}
      defaultValue={defaultValue}
      items={items}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([itemValue, label]) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
