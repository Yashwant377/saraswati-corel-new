import type { Settings } from "@/lib/types";

export default function Logo({ settings, dark = false, small = false }: { settings: Settings; dark?: boolean; small?: boolean }) {
  const b = settings.branding;
  // light logo for dark backgrounds, dark logo for light backgrounds
  const emblem = dark
    ? b.logoLightUrl || b.logoUrl
    : b.logoDarkUrl || b.logoUrl;

  return (
    <a href={b.logoLink || "/"} className="flex items-center gap-2.5" aria-label={b.logoText}>
      {emblem && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={emblem}
          alt=""
          width={small ? 30 : 38}
          height={small ? 28 : 36}
          className="object-contain shrink-0"
          style={{ width: small ? 30 : 38, height: small ? 28 : 36 }}
        />
      )}
      <span className="leading-none">
        <span
          className={`block whitespace-nowrap font-display font-semibold uppercase tracking-[0.14em] ${
            small ? "text-[14px]" : "text-[16.5px]"
          } ${dark ? "text-white" : "text-[var(--text)]"}`}
        >
          {b.logoText}
        </span>
        <span
          className={`mt-1 block whitespace-nowrap text-[8.5px] font-semibold uppercase tracking-[0.3em] ${
            dark ? "text-gold-300" : "text-[var(--gold)]"
          }`}
        >
          {b.logoSubtext}
        </span>
      </span>
    </a>
  );
}
