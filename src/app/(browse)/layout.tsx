import { BrowseMainPad } from "@/components/browse-main-pad";

export default function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BrowseMainPad>{children}</BrowseMainPad>;
}
