import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import StickyCTA from "@/components/site/StickyCTA";
import LeadModalHost from "@/components/site/LeadModalHost";
import FinalCTA from "@/components/site/FinalCTA";
import ConversionKit from "@/components/site/ConversionKit";
import SectionRenderer from "@/components/site/SectionRenderer";
import { getDB, dbReady } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: { preview?: string } }) {
  await dbReady();
  const db = getDB();
  const user = getSessionUser();
  const preview = searchParams.preview === "1" && !!user;

  const sections = [...db.sections]
    .sort((a, b) => a.order - b.order)
    .filter((s) => (preview ? true : s.visible && s.status === "published"));

  return (
    <>
      <a
        href="#overview"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[var(--accent)] focus:px-5 focus:py-2.5 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar settings={db.settings} />
      <main>
        {preview && (
          <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-[99] rounded-full bg-black/85 px-5 py-2 text-xs font-semibold text-white shadow-lift">
            🔍 PREVIEW MODE — showing drafts &amp; hidden sections (admins only)
          </div>
        )}
        {sections.map((s) => (
          <SectionRenderer key={s.id} section={s} settings={db.settings} preview={preview} />
        ))}
        <FinalCTA />
      </main>
      <Footer settings={db.settings} />
      <StickyCTA settings={db.settings} />
      <ConversionKit settings={db.settings} />
      <LeadModalHost />
    </>
  );
}
