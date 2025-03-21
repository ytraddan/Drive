/* eslint-disable @typescript-eslint/only-throw-error */
import { MUTATIONS, QUERIES } from "@/server/db/queries";
import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  driveUploader: f({
    blob: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "64MB",
      maxFileCount: 5,
    },
  })
    .input(
      z.object({
        folderId: z.number(),
      }),
    )
    // Set permissions and file types for this FileRoute
    // This code runs on your server before upload
    .middleware(async ({ input }) => {
      const user = await auth();

      if (!user.userId) throw new UploadThingError("Unauthorized");

      const folder = await QUERIES.getFolderById(input.folderId);

      if (!folder) throw new UploadThingError("Folder not found");
      if (folder.ownerId !== user.userId)
        throw new UploadThingError("Unauthorized");

      return { userId: user.userId, parentId: input.folderId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      await MUTATIONS.createFile({
        ownerId: metadata.userId,
        name: file.name,
        size: file.size,
        url: file.url,
        parent: metadata.parentId,
      });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
