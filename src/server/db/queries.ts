import "server-only";

import { FILE_PATTERNS, type FilePattern } from "@/constants/filePatterns";
import { eq, sql, or, and, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import {
  folders_table as folderSchema,
  files_table as fileSchema,
  type DB_FileType,
} from "@/server/db/schema";

export const QUERIES = {
  getFolders: function (folderId: number) {
    return db
      .select()
      .from(folderSchema)
      .where(eq(folderSchema.parent, folderId))
      .orderBy(folderSchema.id);
  },

  getFolderById: async function (folderId: number) {
    const folder = await db
      .select()
      .from(folderSchema)
      .where(eq(folderSchema.id, folderId));
    return folder[0];
  },

  getRootFolderForUser: async function (userId: string) {
    const folder = await db
      .select()
      .from(folderSchema)
      .where(
        and(eq(folderSchema.ownerId, userId), isNull(folderSchema.parent)),
      );
    return folder[0];
  },

  getFolderParents: async function (folderId: number) {
    const parents = [];
    let currentId: number | null = folderId;

    while (currentId !== null) {
      const folder = await db
        .selectDistinct()
        .from(folderSchema)
        .where(eq(folderSchema.id, currentId));

      if (!folder[0]) {
        throw new Error("Parent folder not found");
      }

      parents.unshift(folder[0]);
      currentId = folder[0].parent;
    }

    return parents;
  },

  getFiles: function (folderId: number) {
    return db
      .select()
      .from(fileSchema)
      .where(eq(fileSchema.parent, folderId))
      .orderBy(fileSchema.id);
  },

  getFilesByCategory: async function (category: FilePattern) {
    return db
      .select()
      .from(fileSchema)
      .where(
        or(
          ...FILE_PATTERNS[category].map(
            (pattern) => sql`LOWER(${fileSchema.name}) LIKE LOWER(${pattern})`,
          ),
        ),
      )
      .orderBy(fileSchema.id);
  },

  getTotalFileSize: async function () {
    const result = await db
      .select({
        total: sql<number>`CAST(sum(${fileSchema.size}) AS SIGNED)`,
      })
      .from(fileSchema);
    return result[0]?.total ?? 0;
  },

  getTotalFileSizeForUser: async function (userId: string) {
    const result = await db
      .select({
        total: sql<number>`CAST(sum(${fileSchema.size}) AS SIGNED)`,
      })
      .from(fileSchema)
      .where(eq(fileSchema.ownerId, userId));
    return result[0]?.total ?? 0;
  },
};

export const MUTATIONS = {
  createFile: async function (input: DB_FileType) {
    return await db.insert(fileSchema).values(input);
  },

  createRootFolder: async function (userId: string) {
    const rootFolderId = await db
      .insert(folderSchema)
      .values({
        name: "My Drive",
        parent: null,
        ownerId: userId,
      })
      .$returningId();

    return rootFolderId[0]?.id;
  },
};
