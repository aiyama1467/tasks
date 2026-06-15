"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import * as backlog from "@/usecases/backlog";

export async function createBacklogItem(data: {
  title: string;
  description?: string;
  categoryId: string;
  status?: string;
  priority?: string;
  url?: string;
}) {
  const userId = await requireUserId();

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
  const userId = await requireUserId();

  await backlog.updateBacklogItem(userId, id, data);
  revalidatePath("/backlog");
  revalidatePath("/dashboard");
}

export async function updateBacklogItemStatus(id: string, status: string) {
  await updateBacklogItem(id, { status });
}

export async function deleteBacklogItem(id: string) {
  const userId = await requireUserId();

  await backlog.deleteBacklogItem(userId, id);
  revalidatePath("/backlog");
  revalidatePath("/dashboard");
}
