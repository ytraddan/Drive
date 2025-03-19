import File from "./components/file";
import Folder from "./components/folder";
import Breadcrumbs from "./components/breadcrumbs";
import type { files as filesT, folders as foldersT } from "@/server/db/schema";

export default function DriveContents({
  files,
  folders,
  parents,
}: {
  files: (typeof filesT.$inferSelect)[];
  folders: (typeof foldersT.$inferSelect)[];
  parents: (typeof foldersT.$inferSelect)[];
}) {
  const Folders = () =>
    folders.map((folder) => <Folder key={folder.id} folder={folder} />);

  const Files = () => files.map((file) => <File key={file.id} file={file} />);

  return (
    <div className="space-y-4">
      <Breadcrumbs parents={parents} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Folders />
        <Files />
      </div>
    </div>
  );
}
