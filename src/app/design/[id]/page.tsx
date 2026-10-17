import { Suspense } from "react";
import { EditorLoader } from "@/components/editor/EditorLoader";
import { requirePageAccess } from "@/lib/server/gate";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess();
  const { id } = await params;
  return (
    <Suspense>
      <EditorLoader kind="design" id={id} />
    </Suspense>
  );
}
