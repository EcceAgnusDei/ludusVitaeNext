import { SiteHeader } from "@/components/site-header";

export default function BrowseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SiteHeader />
      {children}
    </div>
  );
}
