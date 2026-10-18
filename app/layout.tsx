import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getDB, dbReady } from "@/lib/db";
import { legal, faqs } from "@/lib/siteConfig";

const FONT_STACKS: Record<string, { display: string; body: string }> = {
  "elegant-serif": {
    display: '"Fraunces", "Playfair Display", Georgia, serif',
    body: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  "modern-sans": {
    display: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    body: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  },
  geometric: {
    display: '"Poppins", "Inter", ui-sans-serif, system-ui, sans-serif',
    body: '"Poppins", "Inter", ui-sans-serif, system-ui, sans-serif',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  await dbReady();
  const { settings } = getDB();
  const w = settings.website;
  const b = settings.branding;
  return {
    metadataBase: new URL("http://localhost:3000"),
    title: w.title,
    description: w.metaDescription,
    keywords: [
      `${b.logoText} Navi Mumbai`, "apartments CBD Belapur", "2 BHK Navi Mumbai",
      "3 BHK Belapur", "luxury apartments Navi Mumbai", "flats CBD Belapur",
    ],
    openGraph: {
      title: w.title,
      description: w.metaDescription,
      images: [{ url: w.defaultImage || "/images/hero.jpg", width: 1600, height: 900 }],
      type: "website",
      locale: "en_IN",
    },
    twitter: { card: "summary_large_image", title: w.title, description: w.metaDescription },
    robots: { index: true, follow: true },
    icons: b.faviconUrl ? { icon: b.faviconUrl } : undefined,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f6f4f",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await dbReady();
  const { settings } = getDB();
  const t = settings.theme;
  const fonts = FONT_STACKS[t.font] || FONT_STACKS["elegant-serif"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: settings.branding.logoText,
    description: settings.website.metaDescription,
    url: settings.maps.directionsUrl,
    image: settings.website.defaultImage,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contact.address,
      addressLocality: settings.maps.city || "Navi Mumbai",
      addressRegion: settings.maps.state || "Maharashtra",
      addressCountry: "IN",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <html
      lang="en"
      className={t.mode === "dark" ? "dark" : ""}
      data-button={t.buttonStyle}
      data-card={t.cardStyle}
      data-spacing={t.sectionSpacing}
      data-animations={t.animations ? "on" : "off"}
      style={
        {
          "--accent": t.accent,
          "--accent-soft": `${t.accent}1a`,
          "--radius": `${t.radius}px`,
          "--font-display": fonts.display,
          "--font-body": fonts.body,
        } as React.CSSProperties
      }
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <noscript>Your browser does not support JavaScript. Core content is still readable.</noscript>
      </head>
      <body className="font-body">
        {children}
        {/* legal anchors referenced from footer */}
        <span id="privacy" /><span id="terms" /><span id="disclaimer" />
        <div className="sr-only">{legal.privacy} {legal.terms} {legal.disclaimer}</div>
      </body>
    </html>
  );
}
