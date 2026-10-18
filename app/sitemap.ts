import type { MetadataRoute } from "next";
import { getDB, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic"; // build must not depend on the database

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbReady();
  const { sections } = getDB();
  const anchors = sections
    .filter((s) => s.visible && s.status === "published" && s.type !== "hero")
    .map((s) => ({ id: s.id }));

  return [
    { url: "https://example.com/", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...anchors.map((a) => ({
      url: `https://example.com/#${a.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
