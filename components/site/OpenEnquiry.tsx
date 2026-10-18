"use client";

import { openLead, type LeadType } from "@/lib/leadBus";

/**
 * Small client-side wrapper so server components (map, RERA panel, etc.)
 * can open the global enquiry popup without becoming client components
 * themselves.
 */
export default function OpenEnquiry({
  type = "enquiry",
  className = "btn-primary btn-sm",
  children,
  ariaLabel,
  title,
}: {
  type?: LeadType;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
  title?: string;
}) {
  return (
    <button type="button" onClick={() => openLead(type)} className={className} aria-label={ariaLabel} title={title}>
      {children}
    </button>
  );
}

/** Invisible full-area click target that opens the enquiry popup. */
export function EnquiryHitArea({
  label,
  type = "enquiry",
  className = "",
}: {
  label: string;
  type?: LeadType;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openLead(type)}
      aria-label={label}
      className={`absolute inset-0 z-[1] cursor-pointer ${className}`}
    />
  );
}
