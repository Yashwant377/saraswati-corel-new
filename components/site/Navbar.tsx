"use client";

import { useEffect, useState } from "react";
import { Menu, X, Phone, MessageSquareText, LogIn } from "lucide-react";
import Logo from "./Logo";
import { openLead } from "@/lib/leadBus";
import type { Settings } from "@/lib/types";

export default function Navbar({ settings }: { settings: Settings }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const links = settings.website.navLinks || [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const solid = scrolled || menuOpen;

  return (
    <>
      <div className="fixed top-0 inset-x-0 z-50">
      {/* Top utility strip */}
      <div className={`hidden lg:block text-xs transition-colors ${solid ? "bg-[var(--accent)] text-white" : "bg-black/40 text-white/90 backdrop-blur"}`}>
        <div className="container-site flex items-center justify-between py-1.5">
          <p className="flex items-center gap-2">
            <span className="font-semibold">RERA:</span> {settings.rera.number}
          </p>
          <p className="flex items-center gap-4">
            <span>{settings.contact.hours}</span>
            <a href={`tel:${settings.contact.phoneDial}`} className="font-semibold hover:underline">
              {settings.contact.phone}
            </a>
            <span className="text-white/30" aria-hidden="true">|</span>
            <a
              href="/admin/login"
              title="Admin login"
              className="inline-flex items-center gap-1.5 text-white/80 transition-colors hover:text-white hover:underline underline-offset-2"
            >
              <LogIn className="h-3.5 w-3.5" /> Admin Login
            </a>
          </p>
        </div>
      </div>

      <header
        className={`transition-all duration-300 ${
          solid
            ? "nav-solid shadow-soft border-b border-[var(--border)] py-2.5"
            : "bg-transparent py-4"
        }`}
      >
        <nav className="container-site flex items-center justify-between gap-4" aria-label="Main navigation">
          <div className={solid ? "" : "[&_span]:!text-white"}>
            <Logo settings={settings} dark={!solid} small />
          </div>

          <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`whitespace-nowrap px-2.5 xl:px-3 py-2 text-[13.5px] font-medium rounded-full transition-colors ${
                    solid
                      ? "text-[var(--text)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${settings.contact.phoneDial}`}
              className={`hidden md:inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-sm font-semibold rounded-full transition-colors ${
                solid ? "text-[var(--accent)] hover:bg-[var(--accent-soft)]" : "text-white hover:bg-white/10"
              }`}
              aria-label="Call sales desk"
            >
              <Phone className="h-4 w-4" /> {settings.contact.phone}
            </a>
            <button
              onClick={() => openLead("enquiry")}
              className={`hidden sm:inline-flex whitespace-nowrap ${solid ? "btn-primary btn-sm" : "btn-gold btn-sm"} !px-5`}
            >
              <MessageSquareText className="h-4 w-4" /> {settings.website.ctaText || "Enquire Now"}
            </button>
            <button
              className={`lg:hidden rounded-full p-2.5 transition-colors ${solid ? "text-[var(--text)] hover:bg-[var(--surface-2)]" : "text-white hover:bg-white/10"}`}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="modal-enter absolute right-0 top-0 h-full w-[85%] max-w-sm bg-[var(--surface)] shadow-lift flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <Logo settings={settings} small />
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-[var(--surface-2)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-4 py-3 text-[15px] font-medium text-[var(--text)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--border)] p-4 space-y-2.5">
              <a href={`tel:${settings.contact.phoneDial}`} className="btn-outline w-full text-[var(--accent)]">
                <Phone className="h-4 w-4" /> {settings.contact.phone}
              </a>
              <button onClick={() => { setMenuOpen(false); openLead("enquiry"); }} className="btn-primary w-full">
                {settings.website.ctaText || "Enquire Now"}
              </button>
              <a
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
              >
                <LogIn className="h-3.5 w-3.5" /> Admin Login
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
