"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight IntersectionObserver reveal wrapper.
 * Respects the admin "animations" setting: when disabled, CSS forces
 * .reveal to be fully visible (see globals.css).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: any;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("reveal-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("reveal-visible");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as any}
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <div className={`mb-10 md:mb-14 max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <span className="eyebrow mb-3">
          <span className="h-px w-8 bg-[var(--gold)] inline-block" />
          {eyebrow}
        </span>
      )}
      <h2
        className={`h-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.12] ${
          dark ? "text-white" : ""
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base md:text-lg ${dark ? "text-white/70" : "text-[var(--muted)]"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
