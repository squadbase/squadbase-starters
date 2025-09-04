import { formatDateLabel } from "@/lib/date-utils";

interface DateSeparatorProps {
  date: Date;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const formattedDate = formatDateLabel(date);

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">
        {formattedDate}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
