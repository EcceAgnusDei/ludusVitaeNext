import { MonEspaceShell } from "@/features/grids/components/mon-espace-shell";

export default function MonEspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MonEspaceShell>{children}</MonEspaceShell>;
}
