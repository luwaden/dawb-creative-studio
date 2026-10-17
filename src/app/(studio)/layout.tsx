import { AppShell } from "@/components/shell/AppShell";
import { WorkspaceProvider } from "@/components/shell/WorkspaceProvider";
import { requirePageAccess } from "@/lib/server/gate";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  await requirePageAccess();
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
