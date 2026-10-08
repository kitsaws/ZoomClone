import { ComponentGallery } from "@/components/showcase/ComponentGallery";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UI Component Showcase — Zoom Workplace Clone",
  description: "Interactive visual showcase of all Zoom Workplace UI primitives and states.",
};

export default function ComponentsPage() {
  return <ComponentGallery />;
}
