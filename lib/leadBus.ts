/** Tiny event bus so any CTA button can open the global lead modal. */
export type LeadType = "enquiry" | "price" | "visit" | "callback" | "brochure";

export const LEAD_TITLES: Record<LeadType, { title: string; sub: string }> = {
  enquiry: { title: "Enquire Now", sub: "Get complete project details, price list and brochure." },
  price: { title: "Get Price Details", sub: "Latest configuration-wise pricing and availability." },
  visit: { title: "Schedule a Site Visit", sub: "Free pick-up & drop visits, 7 days a week." },
  callback: { title: "Request a Callback", sub: "A property expert will call you within 15 minutes." },
  brochure: { title: "Download Brochure", sub: "Enter your details to receive the full brochure." },
};

export function openLead(type: LeadType = "enquiry") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ag:open-lead", { detail: { type } }));
}
