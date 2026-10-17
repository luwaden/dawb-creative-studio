import { notFound } from "next/navigation";
import { Sheet } from "./Sheet";

// Development-only contact sheet for reviewing template slides.
export default async function Page({ searchParams }: { searchParams: Promise<{ id?: string; w?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { id, w } = await searchParams;
  return <Sheet id={id ?? ""} width={Number(w) || 480} />;
}
