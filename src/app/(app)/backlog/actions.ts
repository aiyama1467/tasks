"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import * as backlog from "@/usecases/backlog";

export async function createBacklogItem(data: {
  title: string;
  description?: string;
  categoryId: string;
  status?: string;
  priority?: string;
  url?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await backlog.createBacklogItem(userId, data);
  revalidatePath("/backlog");
  revalidatePath("/dashboard");
}

export async function updateBacklogItem(
  id: string,
  data: {
    title?: string;
    description?: string;
    categoryId?: string;
    status?: string;
    priority?: string;
    rating?: number | null;
    url?: string | null;
  },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await backlog.updateBacklogItem(userId, id, data);
  revalidatePath("/backlog");
  revalidatePath("/dashboard");
}

export async function updateBacklogItemStatus(id: string, status: string) {
  await updateBacklogItem(id, { status });
}

export async function deleteBacklogItem(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("認証が必要です");

  await backlog.deleteBacklogItem(userId, id);
  revalidatePath("/backlog");
  revalidatePath("/dashboard");
}
