import {
  MapPin, Expand, LayoutGrid, CalendarCheck, HardHat, ShieldCheck,
  BadgeIndianRupee, Mountain, Trees, Gem, PartyPopper, Trophy, Waves, Baby,
  Flower2, Laptop, Route, TrainFront, GraduationCap, HeartPulse,
  BriefcaseBusiness, ShoppingBag, Milestone, Plane, Gift, Percent, CarFront,
  FileDown, CircleHelp, MessageSquareText, Car, PhoneCall, Info, Sparkles,
  Palmtree, Images, Ruler, MapPinned, Timer, Building2, Home, CircleCheckBig,
  TrendingUp, CalendarClock, Quote, Scale, Award, FileCheck2, TicketPercent,
  Phone, Mail, Clock, ChevronDown, ArrowRight, Check, X, Menu, Star,
  BedDouble, Bath, Maximize, Download, Eye, Send, Users, Calendar,
  ArrowUpRight, MessageCircle, Facebook, Instagram, Twitter, Youtube, Linkedin,
  Compass, LandPlot, Dumbbell, Utensils, Croissant, BadgeCheck, QrCode,
  ScanLine, Upload, LogIn, type LucideIcon, Circle,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  MapPin, Expand, LayoutGrid, CalendarCheck, HardHat, ShieldCheck,
  BadgeIndianRupee, Mountain, Trees, Gem, PartyPopper, Trophy, Waves, Baby,
  Flower2, Laptop, Route, TrainFront, GraduationCap, HeartPulse,
  BriefcaseBusiness, ShoppingBag, Milestone, Plane, Gift, Percent, CarFront,
  FileDown, CircleHelp, MessageSquareText, Car, PhoneCall, Info, Sparkles,
  Palmtree, Images, Ruler, MapPinned, Timer, Building2, Home, CircleCheckBig,
  TrendingUp, CalendarClock, Quote, Scale, Award, FileCheck2, TicketPercent,
  Phone, Mail, Clock, ChevronDown, ArrowRight, Check, X, Menu, Star,
  BedDouble, Bath, Maximize, Download, Eye, Send, Users, Calendar,
  ArrowUpRight, MessageCircle, Facebook, Instagram, Twitter, Youtube, Linkedin,
  Compass, LandPlot, Dumbbell, Utensils, Croissant, BadgeCheck, QrCode,
  ScanLine, Upload, LogIn,
};

export function Icon({ name, ...props }: { name: string } & React.ComponentProps<LucideIcon>) {
  const C = MAP[name] || Circle;
  return <C {...props} />;
}

export const ICON_NAMES = Object.keys(MAP);
export type { LucideIcon };
