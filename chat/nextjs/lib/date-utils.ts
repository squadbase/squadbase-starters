import { format, isSameDay, isToday, isYesterday } from "date-fns";

export function shouldShowDateSeparator(
  currentMessage: { createdAt?: Date | string },
  previousMessage: { createdAt?: Date | string } | null
): boolean {
  // Show separator for first message if it has a date
  if (!previousMessage && currentMessage.createdAt) {
    return true;
  }
  
  if (!previousMessage || !currentMessage.createdAt || !previousMessage.createdAt) {
    return false;
  }

  const currentDate = new Date(currentMessage.createdAt);
  const previousDate = new Date(previousMessage.createdAt);

  return !isSameDay(currentDate, previousDate);
}

export function getMessageDate(message: { createdAt?: Date | string }): Date | null {
  if (!message.createdAt) return null;
  return new Date(message.createdAt);
}

export function formatDateLabel(date: Date): string {
  if (isToday(date)) {
    return "Today";
  }
  
  if (isYesterday(date)) {
    return "Yesterday";
  }
  
  // For dates older than yesterday, show MM/dd format
  return format(date, "MM/dd");
}