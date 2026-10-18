import type { Section, Settings } from "@/lib/types";
import { reraDefaults } from "@/lib/siteConfig";
import Hero from "./Hero";
import { OverviewSection, HighlightsSection, PricingSection, AmenitiesSection } from "./Sections1";
import {
  LocationSection, LocationAdvantagesSection, DeveloperSection, OffersSection,
  BrochureSection, GenericSection,
} from "./Sections2";
import GallerySection from "./Gallery";
import ReraSection from "./Rera";
import FloorPlansSection from "./FloorPlans";
import FAQSection from "./FAQ";
import { EnquirySection, SiteVisitSection, ContactSection } from "./Forms";
import { SectionHeading } from "./Reveal";

const BG_CLASS: Record<string, string> = {
  default: "bg-[var(--bg)]",
  alt: "section-alt",
  dark: "bg-[#0e1626] text-white",
};

/**
 * Renders one section shell (anchor, background, spacing, optional preview badge)
 * and delegates to the right section component.
 */
export default function SectionRenderer({
  section,
  settings,
  preview,
}: {
  section: Section;
  settings: Settings;
  preview?: boolean;
}) {
  // In preview mode, overlay pending draft field-edits and draft content
  const eff: Section = preview ? { ...section, ...(section.draftMeta || {}) } : section;
  const content = preview ? (eff.draftData ?? eff.data) : section.data;
  const dirty =
    !!section.draftMeta ||
    JSON.stringify(section.draftData ?? null) !== JSON.stringify(section.data ?? null);

  let inner: React.ReactNode = null;
  switch (eff.type) {
    case "hero":
      return <Hero settings={settings} />;
    case "overview":
      inner = <OverviewSection section={eff} content={content} settings={settings} />;
      break;
    case "highlights":
      inner = <HighlightsSection section={eff} content={content} settings={settings} />;
      break;
    case "pricing":
      inner = <PricingSection section={eff} content={content} settings={settings} />;
      break;
    case "amenities":
      inner = <AmenitiesSection section={eff} content={content} settings={settings} />;
      break;
    case "gallery":
      inner = <GallerySection section={eff} content={content} />;
      break;
    case "floor-plans":
      inner = <FloorPlansSection section={eff} content={content} />;
      break;
    case "location":
      inner = <LocationSection section={eff} content={content} settings={settings} />;
      break;
    case "location-advantages":
      inner = <LocationAdvantagesSection section={eff} content={content} settings={settings} />;
      break;
    case "developer":
      inner = <DeveloperSection section={eff} content={content} settings={settings} />;
      break;
    case "offers":
      inner = <OffersSection section={eff} content={content} settings={settings} />;
      break;
    case "brochure":
      inner = <BrochureSection section={eff} content={content} settings={settings} />;
      break;
    case "faqs":
      inner = <FAQSection section={eff} content={content} />;
      break;
    case "rera":
      inner = <ReraSection section={eff} content={content} settings={settings} defaults={reraDefaults} />;
      break;
    case "enquiry":
      inner = <EnquirySection section={eff} content={content} settings={settings} />;
      break;
    case "site-visit":
      inner = <SiteVisitSection section={eff} content={content} settings={settings} />;
      break;
    case "contact":
      inner = <ContactSection section={eff} content={content} settings={settings} />;
      break;
    default:
      inner = <GenericSection section={eff} content={content} settings={settings} />;
  }

  const isDark = eff.background === "dark";

  return (
    <section
      id={section.id}
      className={`relative scroll-mt-28 ${BG_CLASS[eff.background] || BG_CLASS.default}`}
      aria-label={eff.name}
    >
      <div className={`container-site ${eff.type === "site-visit" ? "section-pad !py-10 sm:!py-14" : "section-pad"}`}>
        {preview && (
          <div className="mb-4 flex items-center gap-2 text-xs">
            {!eff.visible && (
              <span className="rounded-full bg-amber-500 px-3 py-1 font-bold text-black">HIDDEN — preview only</span>
            )}
            {section.status === "draft" && (
              <span className="rounded-full bg-sky-500 px-3 py-1 font-bold text-white">UNPUBLISHED DRAFT</span>
            )}
            {dirty && section.status === "published" && (
              <span className="rounded-full bg-violet-500 px-3 py-1 font-bold text-white">UNPUBLISHED CHANGES</span>
            )}
          </div>
        )}
        {isDark ? <div className="[&_h2]:text-white [&_.eyebrow]:text-gold-300">{inner}</div> : inner}
      </div>
    </section>
  );
}
