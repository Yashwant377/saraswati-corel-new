import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Logo from "./Logo";
import { legal, project } from "@/lib/siteConfig";
import type { Settings } from "@/lib/types";

const SOCIALS: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", twitter: "X / Twitter",
  youtube: "YouTube", linkedin: "LinkedIn",
};

export default function Footer({ settings }: { settings: Settings }) {
  const socials = Object.entries(settings.contact.social || {}).filter(([, v]) => v);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0b1220] text-white pb-24 lg:pb-0" id="footer">
      <div className="container-site py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Logo settings={settings} dark />
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {project.subTagline}
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-semibold text-white/75 hover:border-gold-400 hover:text-gold-300 transition-colors"
                  >
                    {SOCIALS[key] || key}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <nav aria-label="Footer quick links">
            <h3 className="font-display text-base font-semibold mb-4 text-gold-300">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              {settings.website.navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="font-display text-base font-semibold mb-4 text-gold-300">Contact</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex gap-2.5"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-white/50" />
                <a href={`tel:${settings.contact.phoneDial}`} className="hover:text-white">{settings.contact.phone}</a>
              </li>
              <li className="flex gap-2.5"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-white/50" />
                <a href={`mailto:${settings.contact.email}`} className="hover:text-white break-all">{settings.contact.email}</a>
              </li>
              <li className="flex gap-2.5"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-white/50" />
                <span>{settings.contact.address}</span>
              </li>
              <li className="flex gap-2.5"><Clock className="h-4 w-4 mt-0.5 shrink-0 text-white/50" />
                <span>{settings.contact.hours}</span>
              </li>
            </ul>
          </div>

          {/* RERA */}
          <div>
            <h3 className="font-display text-base font-semibold mb-4 text-gold-300">RERA Information</h3>
            <div className="rounded-2xl border border-white/12 bg-white/5 p-4 text-sm">
              <p className="text-white/60 text-xs uppercase tracking-wider font-bold mb-1">Maharashtra RERA No.</p>
              <p className="font-mono text-[13px] text-white break-all">{settings.rera.number}</p>
              <a
                href={settings.rera.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs font-semibold text-gold-300 hover:underline"
              >
                Verify on maharera.maharashtra.gov.in →
              </a>
            </div>
            <p className="mt-4 text-xs text-white/50 leading-relaxed">
              Developed by {settings.branding.developerName}. Marketed by {settings.branding.brokerName}.
            </p>
          </div>
        </div>

        {/* Legal accordions */}
        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {[
            { id: "privacy-card", label: "Privacy Policy", text: legal.privacy },
            { id: "terms-card", label: "Terms & Conditions", text: legal.terms },
            { id: "disclaimer-card", label: "Disclaimer", text: legal.disclaimer },
          ].map((l) => (
            <details key={l.id} id={l.id} className="group rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white flex items-center justify-between">
                {l.label}
                <span className="transition-transform group-open:rotate-45 text-gold-300">+</span>
              </summary>
              <p className="mt-2.5 text-[11.5px] leading-relaxed text-white/50">{l.text}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <p>{settings.website.copyright || `© ${year} ${settings.branding.companyName}`}</p>
          <p>
            {settings.website.footerLinks.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span className="mx-2">·</span>}
                <a href={l.href} className="hover:text-white transition-colors">{l.label}</a>
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
