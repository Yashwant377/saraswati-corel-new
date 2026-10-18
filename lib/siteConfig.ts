/* ============================================================================
 * SITE CONFIGURATION — SINGLE SOURCE OF TRUTH
 * ----------------------------------------------------------------------------
 * Project: SARASWATI CORAL — Premium Luxury Apartments, CBD Belapur, Navi Mumbai
 * Replace the values in this file (or edit them later from the Admin Panel →
 * Settings / Sections) to repurpose this website for any other real-estate
 * project. Everything project-specific lives here.
 * ==========================================================================*/

export type FloorPlanRoom = { x: number; y: number; w: number; h: number; label: string; kind?: "bed" | "bath" | "living" | "kitchen" | "balcony" | "utility" };

export type Configuration = {
  id: string;
  name: string;
  config: string;
  carpetArea: string;
  saleableArea: string;
  price: string;
  priceNote?: string;
  beds: number;
  baths: number;
  balconies: number;
  facing?: string;
  rooms: FloorPlanRoom[]; // coordinates on a 100 x 80 viewBox
};

export const project = {
  name: "Saraswati Coral",
  tagline: "An address of prestige. A lifestyle of distinction.",
  subTagline:
    "Premium luxury apartments in the heart of CBD Belapur, Navi Mumbai — lake-breezed residences, resort-style podium amenities and the city's best connectivity at your doorstep.",
  location: "CBD Belapur, Navi Mumbai, Maharashtra 400614",
  city: "Navi Mumbai",
  startingPrice: "₹1.5 Cr*",
  reraNumber: "PR1330002500304",
  reraUrl: "https://maharera.mahaonline.gov.in",
  totalLand: "2.8 Acres",
  totalUnits: "280 Exclusive Residences",
  towers: "1 Signature Towers · G+27 Floors",
  possession: "Dec 2027 (Onwards)",
  status: "Under Construction · Launch Phase",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=CBD+Belapur+Navi+Mumbai",
  mapCoords: { lat: 19.0178, lng: 73.0291 },
} as const;

export const brandingDefaults = {
  companyName: "Saraswati Group",
  brokerName: "Saraswati Coral Marketing Partners",
  developerName: "Saraswati Group",
  logoText: "SARASWATI CORAL",
  logoSubtext: "Premium Luxury Apartments",
  logoUrl: "/images/logo-emblem.png",
  logoLightUrl: "/images/logo-emblem.png",
  logoDarkUrl: "/images/logo-emblem-navy.png",
  mobileLogoUrl: "",
  faviconUrl: "/images/logo-emblem-navy.png",
  logoWidth: 150,
  logoHeight: 44,
  logoLink: "/",
};

export const contactDefaults = {
  phone: "+91 98000 00000",
  phoneDial: "+919800000000",
  whatsapp: "919800000000",
  email: "sales@saraswaticoral.example",
  address: "Experience Centre, Saraswati Coral, CBD Belapur, Navi Mumbai 400614",
  hours: "Mon–Sun · 9:30 AM – 7:30 PM",
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
  },
};

/**
 * MahaRERA / RERA disclosure section defaults.
 * Both the QR code image and the registration document can be uploaded from
 * Admin → Website Sections → "MahaRERA Details" (no code changes needed).
 */
export const reraDefaults = {
  number: project.reraNumber,
  url: project.reraUrl,
  promoter: "Saraswati Group",
  qrImage: "/images/rera-qr.png", // default: MahaRERA portal QR — replace with your project QR from the admin
  docUrl: "",           // uploaded RERA certificate / registration document
  docLabel: "Download RERA Certificate",
  scanTip: "Scan to verify this project",
  note:
    "Registration details are as declared by the promoter. Prospective purchasers are advised to verify the project details independently on the official MahaRERA portal before taking any decision.",
};

export const websiteDefaults = {
  title: "Saraswati Coral | Premium Luxury Apartments in CBD Belapur, Navi Mumbai",
  metaDescription:
    "Saraswati Coral — premium luxury apartments in CBD Belapur, Navi Mumbai. 2 & 3 BHK lake-facing residences from ₹1.35 Cr*. 40+ amenities, rooftop leisure deck, MahaRERA registered. Book a site visit today.",
  defaultImage: "/images/hero.jpg",
  copyright: `© ${new Date().getFullYear()} Saraswati Group. All rights reserved.`,
  ctaText: "Enquire Now",
  navLinks: [
    { label: "Overview", href: "#overview" },
    { label: "Highlights", href: "#highlights" },
    { label: "Amenities", href: "#amenities" },
    { label: "Floor Plans", href: "#floor-plans" },
    { label: "Gallery", href: "#gallery" },
    { label: "Location", href: "#location" },
    { label: "FAQs", href: "#faqs" },
    { label: "Contact Us", href: "#contact" },
  ],
  footerLinks: [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms & Conditions", href: "#terms" },
    { label: "Disclaimer", href: "#disclaimer" },
  ],
};

export const themeDefaults = {
  mode: "light" as "light" | "dark",
  accent: "#1e2a47",
  font: "geometric" as "elegant-serif" | "modern-sans" | "geometric",
  buttonStyle: "pill" as "pill" | "rounded" | "sharp",
  cardStyle: "elevated" as "elevated" | "flat" | "outline",
  radius: 18, // px — border radius scale for cards
  sectionSpacing: "normal" as "compact" | "normal" | "roomy",
  animations: true,
};

/** Conversion-optimisation widgets (admin-editable) */
export const conversionDefaults = {
  socialProof: true,
  exitIntent: true,
  countdown: true,
  offerEndsAt: new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  enquiriesToday: 27,
  unitsLeft: 14,
  socialMessages: [
    "Rohit D. from Vashi enquired about a 3 BHK",
    "Meera S. from Seawoods booked a site visit",
    "Anil K. from Kharghar downloaded the brochure",
    "Priya N. from Belapur enquired about a 2 BHK",
    "The Sharmas from Nerul booked a weekend site visit",
  ],
};

/* ----------------------------------------------------------------------------
 * CONFIGURATIONS & PRICING
 * --------------------------------------------------------------------------*/
export const configurations: Configuration[] = [
  {
    id: "2bhk",
    name: "2 BHK Bay Residence",
    config: "2 BHK",
    carpetArea: "710 sq.ft",
    saleableArea: "710 sq.ft",
    price: "₹1.5 Cr*",
    beds: 2,
    baths: 2,
    balconies: 1,
    facing: "East / West",
    rooms: [
      { x: 4, y: 6, w: 40, h: 30, label: "Living + Dining", kind: "living" },
      { x: 46, y: 6, w: 26, h: 30, label: "Master Bedroom", kind: "bed" },
      { x: 74, y: 6, w: 22, h: 16, label: "Bedroom 2", kind: "bed" },
      { x: 74, y: 24, w: 22, h: 12, label: "Bath", kind: "bath" },
      { x: 4, y: 38, w: 20, h: 18, label: "Kitchen", kind: "kitchen" },
      { x: 26, y: 38, w: 18, h: 18, label: "Utility", kind: "utility" },
      { x: 46, y: 38, w: 50, h: 10, label: "Balcony", kind: "balcony" },
      { x: 4, y: 58, w: 92, h: 8, label: "Foyer / Corridor" },
    ],
  },
  {
    id: "3bhk",
    name: "3 BHK Coral Residence",
    config: "3 BHK Soldout",
    carpetArea: "985 sq.ft",
    saleableArea: "1310 sq.ft",
    price: "₹1.85 Cr*",
    beds: 3,
    baths: 3,
    balconies: 2,
    facing: "East / Lake-facing",
    rooms: [
      { x: 4, y: 6, w: 44, h: 28, label: "Living + Dining", kind: "living" },
      { x: 50, y: 6, w: 24, h: 28, label: "Master Bedroom", kind: "bed" },
      { x: 76, y: 6, w: 20, h: 14, label: "Bath", kind: "bath" },
      { x: 76, y: 22, w: 20, h: 12, label: "Utility", kind: "utility" },
      { x: 4, y: 36, w: 24, h: 20, label: "Bedroom 2", kind: "bed" },
      { x: 30, y: 36, w: 24, h: 20, label: "Bedroom 3", kind: "bed" },
      { x: 56, y: 36, w: 18, h: 20, label: "Kitchen", kind: "kitchen" },
      { x: 76, y: 36, w: 20, h: 20, label: "Bath 2", kind: "bath" },
      { x: 4, y: 58, w: 92, h: 8, label: "Lake-view Deck", kind: "balcony" },
    ],
  },
];

/* ----------------------------------------------------------------------------
 * OVERVIEW FACTS
 * --------------------------------------------------------------------------*/
export const overviewFacts = [
  { icon: "MapPin", label: "Location", value: "CBD Belapur, Navi Mumbai" },
  { icon: "Expand", label: "Total Land Area", value: "2.8 Acres Private Estate" },
  { icon: "Building2", label: "Total Units", value: "280 Residences · 2 Towers" },
  { icon: "LayoutGrid", label: "Configurations", value: "2 & 3 BHK Luxury Homes" },
  { icon: "CalendarCheck", label: "Possession", value: "Dec 2027 Onwards" },
  { icon: "HardHat", label: "Developer", value: "Saraswati Group" },
  { icon: "ShieldCheck", label: "MahaRERA Registered", value: "PR1330002500304" },
  { icon: "BadgeIndianRupee", label: "Starting Price", value: "₹1.35 Cr* Onwards" },
];

export const overviewText =
  "Saraswati Coral is a landmark of understated luxury in CBD Belapur — two sculpted towers rising over a resort-style podium, with lake-breezed decks, a rooftop leisure level and interiors finished to a boutique standard. Positioned minutes from Palm Beach Marg, Belapur & Seawoods stations and the Navi Mumbai International Airport corridor, it places the best of the city at your doorstep while keeping the world at a graceful distance.";

/* ----------------------------------------------------------------------------
 * HIGHLIGHTS
 * --------------------------------------------------------------------------*/
export const highlights = [
  { icon: "Mountain", title: "2.8-Acre Private Estate", desc: "A gated luxury enclave in the heart of CBD Belapur with 65% open space." },
  { icon: "Waves", title: "Lake-View Residences", desc: "Premium floors open to the lake and waterfront — sunrise decks and sunset lounges." },
  { icon: "Gem", title: "Boutique Residences", desc: "Only 280 homes across 2 towers — privacy, light and low density." },
  { icon: "PartyPopper", title: "Rooftop Leisure Deck", desc: "Infinity-edge pool, sky lounge and open-air cinema on the rooftop level." },
  { icon: "Trophy", title: "Sports & Fitness", desc: "Jogging track, gym area, box cricket, badminton, squash and table tennis." },
  { icon: "Flower2", title: "Wellness Quarter", desc: "Yoga & meditation pavilion, walking track, spa, sauna, jacuzzi and a reflexology walk." },
  { icon: "Baby", title: "Children's World", desc: "Adventure play court, splash pad, crèche and a learning lounge." },
  { icon: "Trees", title: "Landscaped Podium", desc: "A 2-level landscaped podium garden with gazebo areas, water features and cabanas." },
  { icon: "Laptop", title: "Work-From-Home Hub", desc: "Co-working lounge, meeting pods and gigabit fibre to every home." },
];

/* ----------------------------------------------------------------------------
 * AMENITIES
 * --------------------------------------------------------------------------*/
export const amenityCategories = [
  {
    id: "lifestyle",
    title: "Lifestyle",
    image: "/images/clubhouse.jpg",
    items: ["Sky Lounge & Clubhouse", "Infinity-edge Pool", "Spa & Salon", "Gazebo Seating Area", "Residents' Lounge", "Café & Mini Theatre"],
  },
  {
    id: "sports",
    title: "Sports & Fitness",
    image: "/images/sports.jpg",
    items: ["Jogging Track", "Gym Area & CrossFit", "Box Cricket Turf", "Badminton Courts", "Squash Court", "Table Tennis & Games Room"],
  },
  {
    id: "wellness",
    title: "Wellness & Yoga",
    image: "/images/spa.jpg",
    items: ["Yoga & Meditation Pavilion", "Walking Track", "Jacuzzi & Sauna", "Reflexology Walk", "Aromatherapy Room", "Senior Citizens' Nook"],
  },
  {
    id: "family",
    title: "Family & Leisure",
    image: "/images/kids.jpg",
    items: ["Children's Play Court", "Splash Pad", "Multipurpose Lawns", "Gazebo Picnic Deck", "Crèche & Learning Studio", "Party Banquet Lawn"],
  },
];

/* ----------------------------------------------------------------------------
 * GALLERY
 * --------------------------------------------------------------------------*/
export const gallery = [
  { src: "/images/hero.jpg", title: "Saraswati Coral at Dusk", category: "Exterior" },
  { src: "/images/exterior.jpg", title: "Tower Elevation", category: "Exterior" },
  { src: "/images/interior.jpg", title: "Living Room — Show Residence", category: "Interiors" },
  { src: "/images/clubhouse.jpg", title: "Signature Clubhouse", category: "Clubhouse" },
  { src: "/images/pool.jpg", title: "Resort-style Pool Deck", category: "Amenities" },
  { src: "/images/aerial-coast.jpg", title: "CBD Belapur Waterfront", category: "Location" },
  { src: "/images/gym.jpg", title: "Fitness Centre", category: "Amenities" },
  { src: "/images/spa.jpg", title: "Spa & Wellness Suite", category: "Amenities" },
  { src: "/images/kids.jpg", title: "Kids' Adventure Zone", category: "Lifestyle" },
];

/* ----------------------------------------------------------------------------
 * LOCATION — connectivity & landmarks (CBD Belapur, Navi Mumbai)
 * --------------------------------------------------------------------------*/
export const locationIntro = {
  headline: "Well-Connected. Well-Positioned. Well-Lived.",
  body:
    "Located in the well-connected and vibrant CBD Belapur, Saraswati Coral gives you effortless access to business hubs, reputed schools, hospitals, shopping centers, and transport links — bringing every convenience closer to your doorstep.",
};

export const locationGroups = [
  {
    title: "Education & Academia",
    icon: "GraduationCap",
    items: ["Amity International School", "Delhi Public School", "Ryan International School", "Terna Engineering College", "D. Y. Patil University"],
  },
  {
    title: "Healthcare & Wellness",
    icon: "HeartPulse",
    items: ["Apollo Hospitals", "Terna Hospital", "Multi-speciality clinics & diagnostics"],
  },
  {
    title: "Recreation & Leisure",
    icon: "PartyPopper",
    items: ["Wonders Park", "Science Park", "D. Y. Patil Stadium"],
  },
  {
    title: "Shopping & Lifestyle",
    icon: "ShoppingBag",
    items: ["Nexus Seawoods Mall", "D Mart", "Reliance Fresh", "Croma"],
  },
  {
    title: "Connectivity & Transport",
    icon: "TrainFront",
    items: ["Palm Beach Marg", "Belapur & Seawoods Railway Stations", "Navi Mumbai International Airport", "Decathlon Sports", "Atal Setu"],
  },
];

/* Configurable approximate travel times — edit in Admin or here */
export const locationAdvantages = [
  { label: "Palm Beach Marg", time: "2 min", icon: "Route" },
  { label: "Belapur Railway Station", time: "8 min", icon: "TrainFront" },
  { label: "Seawoods Railway Station", time: "12 min", icon: "TrainFront" },
  { label: "Nexus Seawoods Mall", time: "12 min", icon: "ShoppingBag" },
  { label: "Apollo Hospitals", time: "10 min", icon: "HeartPulse" },
  { label: "D. Y. Patil Stadium", time: "10 min", icon: "Trophy" },
  { label: "Navi Mumbai Intl. Airport", time: "25 min", icon: "Plane" },
  { label: "Atal Setu", time: "20 min", icon: "Milestone" },
];

/* ----------------------------------------------------------------------------
 * DEVELOPER
 * --------------------------------------------------------------------------*/
export const developer = {
  name: "Saraswati Group",
  since: 1998,
  yearsExperience: "27+ Years",
  projectsDelivered: "30 Projects Delivered",
  projectsOngoing: "5 Ongoing",
  cities: "Navi Mumbai · Mumbai · Pune",
  sqftDelivered: "1.8 Cr+ sq.ft Developed",
  statement:
    "For over two and a half decades, Saraswati Group has shaped Navi Mumbai's skyline with landmarks known for on-time delivery, transparent dealings and enduring construction quality. Every Saraswati address is MahaRERA registered and cared for by a dedicated community-care team long after handover.",
  credentials: ["MahaRERA Registered", "ISO 9001 Certified", "CRISIL DA-6 Rated", "8,000+ Happy Families"],
};

/* ----------------------------------------------------------------------------
 * OFFERS
 * --------------------------------------------------------------------------*/
export const offers = [
  { icon: "Gift", title: "Launch-Phase Price Window", desc: "Founding-member pricing on the first 50 residences — before the next price revision.", tag: "Limited Period" },
  { icon: "Percent", title: "Flexible Payment Plan", desc: "10:40:50 construction-linked plan — pay 10% at booking and move stress-free.", tag: "All Configs" },
  { icon: "CarFront", title: "Assured Parking + Club Membership", desc: "Complimentary covered parking and 5-year clubhouse membership on every residence.", tag: "All Homes" },
];

/* ----------------------------------------------------------------------------
 * FAQs
 * --------------------------------------------------------------------------*/
export const faqs = [
  { q: "Where exactly is Saraswati Coral located?", a: "Saraswati Coral is in CBD Belapur, Navi Mumbai — minutes from Palm Beach Marg, Belapur & Seawoods railway stations, Nexus Seawoods Mall, Apollo Hospitals and the Navi Mumbai International Airport corridor, with quick access to Atal Setu." },
  { q: "What configurations are available?", a: "We offer 2 BHK (985 sq.ft) and 3 BHK (1310 sq.ft) lake-facing and east/west residences across two G+27 towers." },
  { q: "What is the starting price?", a: "Residences start from ₹1.35 Cr* for a 2 BHK. Prices are indicative and subject to availability, floor rise, view and applicable charges. Request the latest price sheet from our sales desk." },
  { q: "What amenities does the project include?", a: "A rooftop leisure deck with infinity-edge pool and sky lounge, spa-sauna-jacuzzi wellness quarter, box cricket, badminton, squash, gymnasium, yoga pavilion, kids' play court and splash pad, co-working lounge and a two-level landscaped podium garden." },
  { q: "Is the project RERA registered?", a: "Yes. Saraswati Coral is registered with MahaRERA (registration number displayed above and on all marketing material). You can verify it on the official MahaRERA portal." },
  { q: "When is possession expected?", a: "Phase 1 possession is scheduled from December 2027, as per the MahaRERA-declared timeline, with construction-linked payment milestones." },
  { q: "How do I schedule a site visit?", a: "Use the 'Schedule a Site Visit' button anywhere on this page, or call our sales desk. Experience-centre and site visits are available all seven days, including the show residence tour." },
  { q: "What is the booking process?", a: "1) Choose your residence · 2) Pay the booking amount & sign the allotment letter · 3) Complete KYC and sale agreement within 30 days · 4) Follow the construction-linked payment plan · 5) Registration at handover." },
  { q: "What are the maintenance charges?", a: "Maintenance is levied per sq.ft of saleable area as per the society bylaws, covering landscaping, clubhouse operations, security and facility upkeep. The exact tariff is shared in the sale agreement annexure." },
  { q: "Is parking included?", a: "Yes — every residence includes dedicated covered car parking, with additional two-wheeler parking and EV-charging-ready bays in the parking podium." },
];

/* ----------------------------------------------------------------------------
 * TESTIMONIALS (optional custom section content)
 * --------------------------------------------------------------------------*/
export const testimonials = [
  { name: "Rajesh & Anita K.", role: "Booked 3 BHK · Tower A", quote: "The sales team walked us through every document transparently. Construction updates every month — exactly what we wanted in our upgrade home." },
  { name: "Sneha M.", role: "Booked 2 BHK · Seawoods resident", quote: "Ten minutes from Seawoods station and a lake-view deck on the rooftop. My morning swims are the reason I chose Saraswati Coral." },
  { name: "Vikram S.", role: "Booked 3 BHK Coral Residence", quote: "The sky lounge and co-working floor sold me. It feels like a boutique hotel that also happens to be home." },
];

/* ----------------------------------------------------------------------------
 * PAYMENT PLAN (optional custom section content)
 * --------------------------------------------------------------------------*/
export const paymentPlan = [
  { milestone: "On Booking", percent: "10%", note: "Allotment letter & KYC" },
  { milestone: "On Slab — Podium Level", percent: "20%", note: "Within 9 months" },
  { milestone: "On Slab — 10th Floor", percent: "20%", note: "Construction-linked" },
  { milestone: "On Completion — Brickwork", percent: "20%", note: "Construction-linked" },
  { milestone: "On Completion — Finishes", percent: "20%", note: "Construction-linked" },
  { milestone: "At Possession", percent: "10%", note: "Registration & handover" },
];

/* ----------------------------------------------------------------------------
 * CONSTRUCTION UPDATES (optional custom section content)
 * --------------------------------------------------------------------------*/
export const constructionUpdates = [
  { date: "Aug 2026", tower: "Tower A", update: "Slab work completed up to level 12; masonry in progress." },
  { date: "Aug 2026", tower: "Podium", update: "Podium landscape decking and water features underway." },
  { date: "Jul 2026", tower: "Tower B", update: "Raft foundation complete; core walls rising." },
];

/* ----------------------------------------------------------------------------
 * DEFAULT SECTIONS — the landing page renders these in order.
 * Admin Panel → Section Manager can add / hide / reorder / duplicate / edit.
 * --------------------------------------------------------------------------*/
export type SectionDef = {
  id: string;
  type: string;
  name: string;
  title: string;
  subtitle: string;
  icon: string;
  visible: boolean;
  background: "default" | "alt" | "dark";
  layout: "default" | "grid-2" | "grid-3" | "grid-4" | "centered";
  animations: boolean;
  data?: any;
};

export const defaultSections: SectionDef[] = [
  { id: "hero", type: "hero", name: "Hero", title: "", subtitle: "", icon: "Home", visible: true, background: "default", layout: "default", animations: true },
  { id: "overview", type: "overview", name: "Project Overview", title: "A Landmark Address in CBD Belapur", subtitle: "Everything you need to know about Saraswati Coral, at a glance", icon: "Info", visible: true, background: "default", layout: "grid-4", animations: true },
  { id: "highlights", type: "highlights", name: "Project Highlights", title: "Why Saraswati Coral Stands Apart", subtitle: "Nine reasons Navi Mumbai's finest are choosing this address", icon: "Sparkles", visible: true, background: "alt", layout: "grid-3", animations: true },
  { id: "pricing", type: "pricing", name: "Pricing", title: "Transparent, Indicative Pricing", subtitle: "Choose a residence that fits your life and your ambition", icon: "BadgeIndianRupee", visible: true, background: "default", layout: "grid-4", animations: true },
  { id: "amenities", type: "amenities", name: "Amenities", title: "Amenities for Every Mood", subtitle: "Over 40 curated lifestyle, sports, wellness and family experiences", icon: "Palmtree", visible: true, background: "alt", layout: "grid-4", animations: true },
  { id: "gallery", type: "gallery", name: "Gallery", title: "Life at Saraswati Coral", subtitle: "A glimpse of your future home", icon: "Images", visible: true, background: "default", layout: "default", animations: true },
  { id: "floor-plans", type: "floor-plans", name: "Floor Plans", title: "Floor Plans & Layouts", subtitle: "Efficient, Vaastu-aware layouts designed for light, lake breeze and privacy", icon: "Ruler", visible: true, background: "alt", layout: "grid-4", animations: true },
  { id: "location", type: "location", name: "Location", title: "Well-Connected. Well-Positioned. Well-Lived.", subtitle: locationIntro.body, icon: "MapPinned", visible: true, background: "default", layout: "default", animations: true },
  { id: "location-advantages", type: "location-advantages", name: "Location Advantages", title: "Minutes From Everything That Matters", subtitle: "Approximate drive times to key destinations — configure in admin", icon: "Timer", visible: true, background: "alt", layout: "grid-4", animations: true },
  { id: "developer", type: "developer", name: "Developer Information", title: "Built by People You Can Trust", subtitle: "The Saraswati Group track record", icon: "Building2", visible: true, background: "default", layout: "default", animations: true },
  { id: "offers", type: "offers", name: "Offers", title: "Current Launch Offers", subtitle: "Exclusive benefits for founding members", icon: "Gift", visible: true, background: "alt", layout: "grid-3", animations: true },
  { id: "brochure", type: "brochure", name: "Brochure", title: "Download the Full Brochure", subtitle: "Masterplan, specifications, payment plan and price list in one PDF", icon: "FileDown", visible: true, background: "default", layout: "centered", animations: true },
  { id: "faqs", type: "faqs", name: "FAQs", title: "Frequently Asked Questions", subtitle: "Answers before you ask", icon: "CircleHelp", visible: true, background: "alt", layout: "default", animations: true },
  { id: "rera", type: "rera", name: "MahaRERA Details", title: "MahaRERA Registered Project", subtitle: "Verify our registration yourself — transparency you can check in seconds", icon: "BadgeCheck", visible: true, background: "default", layout: "default", animations: true },
  { id: "enquiry", type: "enquiry", name: "Enquiry Form", title: "Get Complete Project Details", subtitle: "Our property experts will share pricing, availability and the brochure", icon: "MessageSquareText", visible: true, background: "default", layout: "default", animations: true },
  { id: "site-visit", type: "site-visit", name: "Site Visit", title: "Experience It In Person", subtitle: "Show residence & site tours, 7 days a week", icon: "Car", visible: true, background: "dark", layout: "default", animations: true },
  { id: "contact", type: "contact", name: "Contact", title: "Talk to a Property Expert", subtitle: "We usually respond within 15 minutes during business hours", icon: "PhoneCall", visible: true, background: "alt", layout: "default", animations: true },
];

/* Custom section templates available from the Section Manager */
export const customSectionTemplates: Record<string, { name: string; title: string; subtitle: string; icon: string; blocks: any[] }> = {
  "why-choose": {
    name: "Why Choose This Project?", title: "Why Choose Saraswati Coral?", subtitle: "The difference is in the details", icon: "CircleCheckBig",
    blocks: [{ kind: "cards3", items: [
      { title: "Lake-View Living", desc: "Premium floors open to the lake and waterfront — light, breeze and sunsets." },
      { title: "Low-Density Luxury", desc: "Only 280 residences across 2 towers — privacy by design." },
      { title: "Construction-Linked Plan", desc: "Pay as it grows — 10:40:50 with no hidden pre-EMI burden." },
      { title: "Vaastu-Aware Layouts", desc: "East & west-facing options with zero dead corners." },
      { title: "Rooftop Leisure Deck", desc: "Infinity pool, sky lounge and open-air cinema above the city." },
      { title: "Managed Community", desc: "Dedicated facility team and app-based resident services." },
    ] }],
  },
  investment: {
    name: "Investment Opportunities", title: "An Address That Appreciates", subtitle: "Why Navi Mumbai remains Mumbai's strongest growth corridor", icon: "TrendingUp",
    blocks: [
      { kind: "paragraph", text: "The Navi Mumbai International Airport, Atal Setu, the upcoming metro corridors and the CBD Belapur business district have positioned this micro-market for sustained residential appreciation. Saraswati Coral's launch-phase entry pricing offers both rental and capital-gains potential." },
      { kind: "stats", items: [ { value: "27+", label: "Years of developer trust" }, { value: "2 min", label: "To Palm Beach Marg" }, { value: "25 min", label: "To intl. airport" }, { value: "280", label: "Exclusive residences" } ] },
    ],
  },
  "construction-updates": {
    name: "Construction Updates", title: "Construction Updates", subtitle: "Progress you can verify, month after month", icon: "HardHat",
    blocks: [{ kind: "timeline", items: constructionUpdates }],
  },
  "payment-plans": {
    name: "Payment Plans", title: "Flexible Payment Plan", subtitle: "Construction-linked 10:40:50 — pay as your home grows", icon: "CalendarClock",
    blocks: [{ kind: "table", columns: ["Milestone", "Share", "Note"], rows: paymentPlan.map((p) => [p.milestone, p.percent, p.note]) }],
  },
  "nearby-schools": {
    name: "Nearby Schools", title: "Education & Academia Nearby", subtitle: "The best of Navi Mumbai's schools and campuses", icon: "GraduationCap",
    blocks: [{ kind: "cards3", items: [
      { title: "Amity International School", desc: "CBSE / IB · minutes from the project" },
      { title: "Delhi Public School", desc: "CBSE · a short drive away" },
      { title: "Ryan International School", desc: "ICSE / CBSE · nearby" },
      { title: "Terna Engineering College", desc: "Premier engineering campus" },
      { title: "D. Y. Patil University", desc: "Medical & management university" },
    ] }],
  },
  "nearby-it": {
    name: "Nearby Business Hubs", title: "Near Employment Hubs", subtitle: "Shorter commutes, better life", icon: "BriefcaseBusiness",
    blocks: [{ kind: "cards3", items: [
      { title: "CBD Belapur Business District", desc: "Government & corporate offices within minutes" },
      { title: "Seawoods Grand Central", desc: "Integrated commercial & retail hub" },
      { title: "Navi Mumbai SEZ & IT Parks", desc: "IT/ITES campuses along the corridor" },
    ] }],
  },
  testimonials: {
    name: "Customer Testimonials", title: "What Our Buyers Say", subtitle: "Trust built one family at a time", icon: "Quote",
    blocks: [{ kind: "testimonials", items: testimonials }],
  },
  comparison: {
    name: "Project Comparison", title: "How We Compare", subtitle: "Saraswati Coral vs typical projects in the micro-market", icon: "Scale",
    blocks: [{ kind: "table", columns: ["Parameter", "Saraswati Coral", "Typical Project"], rows: [
      ["Open space", "65% of 2.8 acres", "40–55%"],
      ["Density", "280 homes / 2 towers", "Higher density"],
      ["Leisure", "Rooftop infinity pool + sky lounge", "Podium pool only"],
      ["Payment plan", "10:40:50 construction-linked", "Possession-heavy"],
      ["RERA", "MahaRERA registered", "Verify individually"],
    ] }],
  },
  "track-record": {
    name: "Builder Track Record", title: "The Saraswati Track Record", subtitle: "Delivered promises since 1998", icon: "Award",
    blocks: [
      { kind: "stats", items: [ { value: "30", label: "Projects delivered" }, { value: "1.8 Cr+", label: "Sq.ft developed" }, { value: "8,000+", label: "Families housed" }, { value: "3", label: "Cities" } ] },
      { kind: "paragraph", text: "Saraswati Group has maintained an on-time delivery record across market cycles, with communities that continue to be managed by in-house facility teams long after handover." },
    ],
  },
  "legal-docs": {
    name: "Legal Documents", title: "Legal & Statutory Documents", subtitle: "Transparency you can verify", icon: "FileCheck2",
    blocks: [{ kind: "docs", items: [
      { title: "MahaRERA Registration", desc: "Verify on the official MahaRERA portal" },
      { title: "Title & Land Documents", desc: "Available for review at the experience centre" },
      { title: "Environmental & Airport Clearances", desc: "Statutory approvals in place" },
      { title: "Sale Agreement Template", desc: "Maharashtra standard format, shared pre-booking" },
    ] }],
  },
  rera: {
    name: "MahaRERA / RERA Details", title: "MahaRERA Registered Project", subtitle: "Verify our registration — QR code & certificate", icon: "BadgeCheck",
    blocks: [],
  },
  "special-offers": {
    name: "Special Offers", title: "Special Offers", subtitle: "Ask our team what's live this month", icon: "TicketPercent",
    blocks: [{ kind: "cards3", items: offers.map((o) => ({ title: o.title, desc: o.desc })) }],
  },
};

/* Footer legal texts */
export const legal = {
  privacy:
    "Your details submitted on this website are collected solely to respond to your enquiry about this project. We do not sell personal data. You may request deletion of your data by writing to our privacy contact at any time.",
  terms:
    "All content on this website — images, plans, specifications and pricing — is indicative and for representation purposes. This is a marketing website; the legally binding documents are the allotment letter and sale agreement. Prices and availability are subject to change without notice.",
  disclaimer:
    "This website is a marketing initiative and does not constitute an offer or contract. Images are artistic impressions; actual product may vary. MahaRERA registration details are as declared by the developer. Buyers are advised to verify all information independently, including on the MahaRERA portal, before making any decision.",
};
