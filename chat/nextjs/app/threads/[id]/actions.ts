"use server";

import { updateThread } from "@/src/db/queries/threads";
import { revalidatePath } from "next/cache";

export async function updateThreadTitle(threadId: string, title: string) {
  try {
    await updateThread(threadId, { title });
    revalidatePath(`/threads/${threadId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update thread title:", error);
    return { success: false, error: "Failed to update title" };
  }
}