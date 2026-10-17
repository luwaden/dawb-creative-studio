import { Suspense } from "react";
import { TemplateLibrary } from "@/components/templates/TemplateLibrary";

export const metadata = { title: "Templates · DAWB Creative Studio" };

export default function TemplatesPage() {
  return (
    <Suspense>
      <TemplateLibrary />
    </Suspense>
  );
}
