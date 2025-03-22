import { ClockIcon, FolderPlusIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import File from "@/components/file";
import Folder from "@/components/folder";
import type { DB_FileType, DB_FolderType } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { MUTATIONS, QUERIES } from "@/server/db/queries";
import { redirect } from "next/navigation";

const recentFolders: DB_FolderType[] = [
  { id: 1, name: "Documents", ownerId: "1" },
  { id: 2, name: "Photos", ownerId: "1" },
];

const recentFiles: DB_FileType[] = [
  {
    id: 1,
    name: "report.pdf",
    size: 2300,
    url: "#",
    parent: 1,
    ownerId: "1",
    fileKey: "fdsf",
  },
  {
    id: 2,
    name: "presentation.pptx",
    size: 4700,
    url: "#",
    parent: 1,
    ownerId: "1",
    fileKey: "fdsf",
  },
];

export default async function Home() {
  const { userId } = await auth();

  const rootFolder = await QUERIES.getRootFolderForUser(userId!);

  const WelcomeSection = () => (
    <section className="rounded-lg bg-zinc-900/70 p-8 text-white">
      <h1 className="text-3xl font-bold">Welcome to My Drive</h1>
      <p className="mt-2 text-lg">
        Securely store, access, and share your files from anywhere
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {/* <Button variant="secondary" className="flex items-center gap-2">
      <Upload size={16} />
      Upload File
    </Button>
    <Button variant="secondary" className="flex items-center gap-2">
      <FolderPlus size={16} />
      New Folder
    </Button> */}
        <form
          action={async () => {
            "use server";
            const rootFolderId = await MUTATIONS.createRootFolder(userId!);

            return redirect(`/drive/folder/${rootFolderId}`);
          }}
        >
          <Button
            type="submit"
            variant="secondary"
            className="flex items-center gap-2"
          >
            <FolderPlusIcon size={16} />
            Create New Drive
          </Button>
        </form>
      </div>
    </section>
  );

  return (
    <div className="space-y-8">
      {!rootFolder && <WelcomeSection />}

      {/* Recent items section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <ClockIcon size={20} /> Recent Items
        </h2>

        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recentFiles.map((file) => (
            <File key={file.id} file={file} />
          ))}
          {recentFolders.map((folder) => (
            <Folder key={folder.id} folder={folder} />
          ))}
        </div>
      </section>

      {/* Quick access section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <StarIcon size={20} /> Starred
        </h2>
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <p>Items you star will appear here for quick access</p>
          <Button variant="outline" className="mt-4">
            View All Files
          </Button>
        </div>
      </section>
    </div>
  );
}
