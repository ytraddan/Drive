"use server";

import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { files_table } from "./db/schema";
import { auth } from "@clerk/nextjs/server";
import { UTApi } from "uploadthing/server";
import { revalidatePath } from "next/cache";

const utApi = new UTApi();

export async function deleteFile(fileId: number) {
  const session = await auth();

  if (!session.userId) {
    return { error: "Unauthorized" };
  }

  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  if (!file) {
    return { error: "File not found" };
  }

  const utApiResult = await utApi.deleteFiles(file.fileKey);
  console.log(utApiResult);

  const dbDeleteResult = await db
    .delete(files_table)
    .where(eq(files_table.id, fileId));
  console.log(dbDeleteResult);

  revalidatePath(`/folder/${file.parent}`);

  return { success: true };
}
