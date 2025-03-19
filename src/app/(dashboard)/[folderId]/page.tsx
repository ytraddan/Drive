import { QUERIES } from "@/server/db/queries";
import DriveContents from ".././drive-contents";

export default async function MyDrive(props: {
  params: Promise<{ folderId: string }>;
}) {
  const params = await props.params;
  const parsedFolderId = parseInt(params.folderId);

  if (isNaN(parsedFolderId)) {
    return <div>Invalid Id</div>;
  }

  const [folders, files, parents] = await Promise.all([
    QUERIES.getFolders(parsedFolderId),
    QUERIES.getFiles(parsedFolderId),
    QUERIES.getAllFolderParents(parsedFolderId),
  ]);

  return <DriveContents files={files} folders={folders} parents={parents} />;
}
