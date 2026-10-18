"use client";

import { openLead, LeadType } from "@/lib/leadBus";

/** Client button that opens the global lead modal. Usable inside server components. */
export default function CTAButton({
  type = "enquiry",
  className = "btn-primary",
  children,
}: {
  type?: LeadType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => openLead(type)}>
      {children}
    </button>
  );
}
