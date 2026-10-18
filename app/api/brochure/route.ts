import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { project, configurations, amenityCategories, locationAdvantages, developer, contactDefaults } from "@/lib/siteConfig";
import { getDB, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

const ACCENT = rgb(0.12, 0.44, 0.31);
const GOLD = rgb(0.79, 0.6, 0.29);
const DARK = rgb(0.09, 0.13, 0.11);
const GREY = rgb(0.4, 0.45, 0.42);
const LIGHT = rgb(0.96, 0.97, 0.95);

async function embedImg(pdf: PDFDocument, file: string) {
  const bytes = fs.readFileSync(path.join(process.cwd(), "public", file));
  return file.endsWith(".png") ? pdf.embedPng(bytes) : pdf.embedJpg(bytes);
}

/** Standard PDF fonts use WinAnsi encoding — map common non-Latin glyphs. */
function sanitize(s: any): string {
  return String(s ?? "")
    .replace(/₹/g, "Rs. ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/…/g, "...")
    .replace(/[·•]/g, "-")
    .replace(/✓/g, "*")
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "");
}

/** Wraps a PDFPage so every drawText call is WinAnsi-safe. */
function safe(page: any): any {
  return new Proxy(page, {
    get(t, k) {
      if (k === "drawText") return (text: any, opts: any) => t.drawText(sanitize(text), opts);
      const v = (t as any)[k];
      return typeof v === "function" ? v.bind(t) : v;
    },
  });
}

export async function GET() {
  await dbReady();
  const { settings } = getDB();
  const c = settings.contact;
  const pdf = await PDFDocument.create();
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89; // A4

  const drawWrapped = (page: any, textRaw: string, x: number, y: number, maxW: number, size: number, font: any, color: any, lineH: number) => {
    const text = sanitize(textRaw);
    const words = text.split(" ");
    let line = "";
    let cy = y;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW) {
        page.drawText(line, { x, y: cy, size, font, color });
        line = w;
        cy -= lineH;
      } else line = test;
    }
    if (line) { page.drawText(line, { x, y: cy, size, font, color }); cy -= lineH; }
    return cy;
  };

  /* ------------------------------- COVER ------------------------------- */
  const cover = safe(pdf.addPage([W, H]));
  const hero = await embedImg(pdf, "/images/hero.jpg");
  const heroDim = hero.scale(1);
  const coverScale = Math.max(W / heroDim.width, H / heroDim.height);
  cover.drawImage(hero, {
    x: (W - heroDim.width * coverScale) / 2,
    y: (H - heroDim.height * coverScale) / 2,
    width: heroDim.width * coverScale,
    height: heroDim.height * coverScale,
  });
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0, 0, 0), opacity: 0.42 });
  cover.drawRectangle({ x: 0, y: 0, width: W, height: 210, color: rgb(0, 0, 0), opacity: 0.45 });
  cover.drawText(project.name.toUpperCase(), { x: 48, y: 140, size: 44, font: helvB, color: rgb(1, 1, 1) });
  cover.drawText(project.tagline, { x: 50, y: 112, size: 17, font: helv, color: GOLD });
  cover.drawText(project.location, { x: 50, y: 86, size: 11, font: helv, color: rgb(0.9, 0.9, 0.9) });
  cover.drawText(`RERA No: ${settings.rera.number}`, { x: 50, y: 64, size: 9.5, font: helv, color: rgb(0.8, 0.8, 0.8) });
  cover.drawText("PROJECT E-BROCHURE", { x: 50, y: H - 70, size: 12, font: helvB, color: rgb(1, 1, 1) });
  cover.drawRectangle({ x: 50, y: H - 80, width: 60, height: 3, color: GOLD });
  cover.drawText(`Starting ${project.startingPrice}  ·  2 & 3 BHK  ·  Possession ${project.possession}`, {
    x: 50, y: 36, size: 10.5, font: helv, color: rgb(0.95, 0.95, 0.95),
  });

  /* ------------------------------ OVERVIEW ------------------------------ */
  const p2 = safe(pdf.addPage([W, H]));
  p2.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: LIGHT });
  p2.drawText("PROJECT OVERVIEW", { x: 48, y: H - 58, size: 20, font: helvB, color: DARK });
  p2.drawRectangle({ x: 48, y: H - 68, width: 46, height: 3, color: GOLD });

  const ext = await embedImg(pdf, "/images/exterior.jpg");
  const extDim = ext.scale(1);
  const imgW = W - 96;
  const imgH = (extDim.height / extDim.width) * imgW * 0.55;
  p2.drawImage(ext, { x: 48, y: H - 110 - imgH, width: imgW, height: imgH });

  let y = H - 140 - imgH;
  const facts = [
    ["Location", project.location],
    ["Total Land Area", `${project.totalLand} · ${project.towers}`],
    ["Total Units", project.totalUnits],
    ["Configurations", "2 BHK · 3 BHK"],
    ["Possession", project.possession],
    ["Status", project.status],
    ["Developer", `${developer.name} · ${developer.yearsExperience}`],
    ["RERA", settings.rera.number],
  ];
  facts.forEach(([k, v], i) => {
    const fy = y - i * 26;
    p2.drawText(k.toUpperCase(), { x: 48, y: fy, size: 8.5, font: helvB, color: GREY });
    p2.drawText(v, { x: 190, y: fy, size: 10, font: helv, color: DARK });
    if (i < facts.length - 1) p2.drawLine({ start: { x: 48, y: fy - 9 }, end: { x: W - 48, y: fy - 9 }, thickness: 0.6, color: rgb(0.85, 0.87, 0.85) });
  });

  /* ------------------------------- PRICING ------------------------------ */
  const p3 = safe(pdf.addPage([W, H]));
  p3.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: LIGHT });
  p3.drawText("CONFIGURATIONS & INDICATIVE PRICING", { x: 48, y: H - 58, size: 20, font: helvB, color: DARK });
  p3.drawRectangle({ x: 48, y: H - 68, width: 46, height: 3, color: GOLD });

  p3.drawRectangle({ x: 48, y: H - 130, width: imgW, height: 28, color: ACCENT });
  ["Configuration", "Carpet Area", "Saleable Area", "Starting Price"].forEach((h, i) => {
    p3.drawText(h, { x: 60 + i * 128, y: H - 121, size: 10, font: helvB, color: rgb(1, 1, 1) });
  });
  configurations.forEach((cfg, i) => {
    const ry = H - 130 - (i + 1) * 34;
    if (i % 2 === 0) p3.drawRectangle({ x: 48, y: ry - 6, width: imgW, height: 34, color: LIGHT });
    [cfg.config, cfg.carpetArea, cfg.saleableArea, cfg.price].forEach((v, j) => {
      p3.drawText(v, { x: 60 + j * 128, y: ry + 6, size: j === 3 ? 11 : 10, font: j === 3 ? helvB : helv, color: j === 3 ? ACCENT : DARK });
    });
  });
  p3.drawText("*Prices are indicative and subject to availability and applicable charges.", {
    x: 48, y: H - 130 - configurations.length * 34 - 26, size: 8.5, font: helv, color: GREY,
  });

  const ch = await embedImg(pdf, "/images/clubhouse.jpg");
  const chDim = ch.scale(1);
  const p3ImgH = 200;
  p3.drawImage(ch, { x: 48, y: 60, width: imgW, height: p3ImgH });
  p3.drawText("Two signature clubhouses · 60,000 sq.ft of curated lifestyle", {
    x: 48, y: 44, size: 9, font: helv, color: GREY,
  });

  /* ------------------------------ AMENITIES ----------------------------- */
  const p4 = safe(pdf.addPage([W, H]));
  p4.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: LIGHT });
  p4.drawText("AMENITIES", { x: 48, y: H - 58, size: 20, font: helvB, color: DARK });
  p4.drawRectangle({ x: 48, y: H - 68, width: 46, height: 3, color: GOLD });

  const imgs = [
    ["/images/pool.jpg", "Swimming Pools"],
    ["/images/gym.jpg", "Fitness Centre"],
    ["/images/spa.jpg", "Spa & Wellness"],
    ["/images/kids.jpg", "Kids' Zones"],
  ];
  for (let i = 0; i < imgs.length; i++) {
    const im = await embedImg(pdf, imgs[i][0] as string);
    const d = im.scale(1);
    const cw = (imgW - 16) / 2;
    const cx = 48 + (i % 2) * (cw + 16);
    const cy = H - 120 - Math.floor(i / 2) * 175;
    p4.drawImage(im, { x: cx, y: cy - 140, width: cw, height: 140 });
    p4.drawText(imgs[i][1] as string, { x: cx, y: cy - 156, size: 9.5, font: helvB, color: DARK });
  }

  let ay = H - 490;
  amenityCategories.forEach((cat) => {
    p4.drawText(cat.title.toUpperCase(), { x: 48, y: ay, size: 10, font: helvB, color: ACCENT });
    ay = drawWrapped(p4, cat.items.join("  ·  "), 48, ay - 15, imgW, 9.5, helv, GREY, 13);
    ay -= 8;
  });

  /* --------------------------- LOCATION + CONTACT ------------------------ */
  const p5 = safe(pdf.addPage([W, H]));
  p5.drawRectangle({ x: 0, y: H - 90, width: W, height: 90, color: LIGHT });
  p5.drawText("LOCATION ADVANTAGES & CONTACT", { x: 48, y: H - 58, size: 20, font: helvB, color: DARK });
  p5.drawRectangle({ x: 48, y: H - 68, width: 46, height: 3, color: GOLD });

  locationAdvantages.forEach((a, i) => {
    const lx = 48 + (i % 2) * ((imgW) / 2);
    const ly = H - 140 - Math.floor(i / 2) * 44;
    p5.drawRectangle({ x: lx, y: ly - 14, width: imgW / 2 - 10, height: 38, color: LIGHT });
    p5.drawText(a.time, { x: lx + 12, y: ly, size: 14, font: helvB, color: ACCENT });
    p5.drawText(a.label, { x: lx + 12, y: ly - 12, size: 8.5, font: helv, color: DARK });
  });

  let cy2 = H - 140 - Math.ceil(locationAdvantages.length / 2) * 44 - 40;
  const land = await embedImg(pdf, "/images/landscape.jpg");
  const lDim = land.scale(1);
  p5.drawImage(land, { x: 48, y: cy2 - 150, width: imgW, height: 150 });
  cy2 -= 190;

  p5.drawRectangle({ x: 0, y: 0, width: W, height: cy2 < 150 ? 150 : cy2, color: DARK });
  const by = Math.min(cy2, 150) - 34;
  p5.drawText(project.name.toUpperCase(), { x: 48, y: by, size: 18, font: helvB, color: rgb(1, 1, 1) });
  p5.drawText([
    `Sales: ${c.phone || contactDefaults.phone}   ·   ${c.email || contactDefaults.email}`,
    `${c.address || contactDefaults.address}`,
    `RERA No: ${settings.rera.number}   ·   Developer: ${settings.branding.developerName}`,
    "*Images are artistic impressions. This brochure is not an offer or contract.",
  ].join("\n"), { x: 48, y: by - 22, size: 9, font: helv, color: rgb(0.75, 0.78, 0.76), lineHeight: 15 });

  pdf.setTitle(`${project.name} — E-Brochure`);
  pdf.setAuthor(settings.branding.companyName);
  pdf.setSubject(`${project.name} project brochure`);

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${project.name.replace(/\s+/g, "-")}-Brochure.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
