import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getDB, mutate, uid, audit, dbReady } from "@/lib/db";
import { customSectionTemplates } from "@/lib/siteConfig";
import type { Section } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbReady();
  const user = apiUser("manage_sections");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sections = [...getDB().sections].sort((a, b) => a.order - b.order);
  return NextResponse.json({ sections, templates: Object.keys(customSectionTemplates) });
}

export async function POST(req: NextRequest) {
  await dbReady();
  const user = apiUser("manage_sections");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const db = getDB();
  const maxOrder = db.sections.reduce((m, s) => Math.max(m, s.order), -1);

  let section: Section;

  if (body.duplicateOf) {
    const src = db.sections.find((s) => s.id === body.duplicateOf);
    if (!src) return NextResponse.json({ error: "Section not found." }, { status: 404 });
    section = {
      ...JSON.parse(JSON.stringify(src)),
      id: uid(),
      name: `${src.name} (Copy)`,
      order: maxOrder + 1,
      status: "draft",
      updatedAt: new Date().toISOString(),
    };
  } else if (String(body.template || "") === "rera") {
    const id = uid();
    section = {
      id,
      type: "rera",
      name: body.name || "MahaRERA Details",
      title: body.title || "MahaRERA Registered Project",
      subtitle: body.subtitle || "Verify our registration yourself — transparency you can check in seconds",
      icon: body.icon || "BadgeCheck",
      visible: true,
      order: maxOrder + 1,
      background: "default",
      layout: "default",
      animations: true,
      status: "draft",
      data: null,
      draftData: null,
      updatedAt: new Date().toISOString(),
    };
  } else {
    const tplKey = String(body.template || "");
    const tpl = customSectionTemplates[tplKey];
    const id = uid();
    section = {
      id,
      type: tpl ? `custom-${tplKey}` : "custom",
      name: body.name || tpl?.name || "Custom Section",
      title: body.title || tpl?.title || "New Section",
      subtitle: body.subtitle || tpl?.subtitle || "",
      icon: body.icon || tpl?.icon || "Sparkles",
      visible: true,
      order: maxOrder + 1,
      background: "default",
      layout: "grid-3",
      animations: true,
      status: "draft",
      data: null,
      draftData: tpl ? { blocks: tpl.blocks } : { blocks: [] },
      updatedAt: new Date().toISOString(),
    };
  }

  mutate((db) => {
    db.sections.push(section);
    audit(db, "section_create", user.id, { id: section.id, name: section.name });
  });

  return NextResponse.json({ section }, { status: 201 });
}
