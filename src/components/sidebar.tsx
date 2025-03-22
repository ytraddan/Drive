import { UploadButton } from "@/components/upload-button";
import { Button } from "@/components/ui/button";
import { Storage } from "@/components/storage";
import {
  ClockIcon,
  FileTextIcon,
  HardDriveIcon,
  ImageIcon,
  StarIcon,
  Trash2Icon,
  AudioLinesIcon,
  ClapperboardIcon,
} from "lucide-react";
import Link from "next/link";
import { QUERIES } from "@/server/db/queries";
import { auth } from "@clerk/nextjs/server";

const mainNavItems = [
  { Icon: ClockIcon, label: "Recent", href: "/drive/recent" },
  { Icon: StarIcon, label: "Starred", href: "/drive/starred" },
  { Icon: Trash2Icon, label: "Trash", href: "/drive/trash" },
];

const categoryItems = [
  { Icon: ImageIcon, label: "Images", href: "/drive/images" },
  { Icon: FileTextIcon, label: "Documents", href: "/drive/documents" },
  { Icon: AudioLinesIcon, label: "Audio", href: "/drive/audio" },
  { Icon: ClapperboardIcon, label: "Video", href: "/drive/video" },
];

const SidebarItem = ({ Icon, label, href }: (typeof categoryItems)[0]) => {
  return (
    <Button variant="ghost" className="w-full justify-start" asChild>
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
};

export default async function Sidebar() {
  const { userId } = await auth();

  const rootFolderId = await QUERIES.getRootFolderForUser(userId!);

  return (
    <div className="hidden w-64 overflow-y-auto border-r border-border p-4 md:block">
      <div className="space-y-6">
        <UploadButton />

        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href={`/drive/folder/${rootFolderId?.id}`}>
              <HardDriveIcon className="mr-2 h-4 w-4" />
              Drive
            </Link>
          </Button>
          {mainNavItems.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </div>

        <div className="space-y-1">
          <h3 className="px-2 text-xs font-semibold text-muted-foreground">
            Categories
          </h3>
          {categoryItems.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </div>
        <Storage />
      </div>
    </div>
  );
}
