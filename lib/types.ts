export type Role =
  | "super_admin"
  | "content_manager"
  | "sales_manager"
  | "sales_agent"
  | "enquiry_manager";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  content_manager: "Content Manager",
  sales_manager: "Sales Manager",
  sales_agent: "Sales Agent",
  enquiry_manager: "Enquiry Manager",
};

export type Permission =
  | "manage_sections"
  | "manage_settings"
  | "view_leads"
  | "manage_leads"
  | "view_visits"
  | "manage_visits"
  | "manage_users"
  | "manage_security";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "manage_sections", "manage_settings", "view_leads", "manage_leads",
    "view_visits", "manage_visits", "manage_users", "manage_security",
  ],
  content_manager: ["manage_sections", "manage_settings", "view_leads"],
  sales_manager: ["view_leads", "manage_leads", "view_visits", "manage_visits"],
  sales_agent: ["view_leads", "view_visits"],
  enquiry_manager: ["view_leads", "manage_leads", "view_visits"],
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: Role;
  passwordHash: string;
  mustChangePassword: boolean;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
};

export type Section = {
  id: string;
  type: string;
  name: string;
  title: string;
  subtitle: string;
  icon: string;
  visible: boolean;
  order: number;
  background: "default" | "alt" | "dark";
  layout: "default" | "grid-2" | "grid-3" | "grid-4" | "centered";
  animations: boolean;
  status: "published" | "draft";
  data: any;          // published content
  draftData: any;     // working copy (Save draft writes here; Publish promotes it)
  draftMeta?: any;    // pending field edits (title/subtitle/icon/…) promoted on Publish
  updatedAt: string;
};

export type Settings = {
  branding: typeof import("./siteConfig").brandingDefaults;
  contact: typeof import("./siteConfig").contactDefaults;
  website: typeof import("./siteConfig").websiteDefaults;
  theme: typeof import("./siteConfig").themeDefaults;
  conversion: typeof import("./siteConfig").conversionDefaults;
  maps: {
    address: string;
    lat: number;
    lng: number;
    directionsUrl: string;
    city: string;
    state: string;
  };
  rera: { number: string; url: string };
};

export type Lead = {
  id: string;
  type: "enquiry" | "price" | "visit" | "callback" | "brochure";
  name: string;
  phone: string;
  email: string;
  configuration: string;
  message: string;
  preferredDate?: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "site_visit" | "closed_won" | "closed_lost";
  assignedTo?: string;
  createdAt: string;
};

export type SiteVisit = {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredSlot: string;
  mode: "self" | "pickup";
  notes: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

export type PasswordResetRequest = {
  id: string;
  email: string;
  createdAt: string;
  resolved: boolean;
};

export type DB = {
  version: number;
  users: AdminUser[];
  sections: Section[];
  settings: Settings;
  leads: Lead[];
  visits: SiteVisit[];
  passwordResets: PasswordResetRequest[];
  auditLog: { id: string; at: string; userId?: string; action: string; meta?: any }[];
};
