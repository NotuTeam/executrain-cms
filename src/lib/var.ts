/** @format */
import {
  Home,
  BarChart3,
  Settings,
  Users,
  Layers,
  Image,
  Megaphone,
  Package,
  SearchCheck,
  FileText,
  Briefcase,
} from "lucide-react";

export const ValidPath = [
  "",
  "users",
  "reports",
  "settings",
  "pages",
  "schedule",
  "content",
  "product",
  "promotion",
  "article",
  "career",
];
export const DefaultMenu = [
  { id: 1, text: "Home", icon: Home, href: "/" },
  {
    id: 2,
    text: "Management",
    icon: Settings,
    children: [
      { id: 21, text: "Services", icon: Settings, href: "/services" },
      { id: 22, text: "Product", icon: Package, href: "/product" },
      { id: 23, text: "Schedule", icon: BarChart3, href: "/schedule" },
      { id: 24, text: "Promotion", icon: Megaphone, href: "/promotion" },
    ],
  },
  {
    id: 3,
    text: "Content",
    icon: Image,
    children: [
      { id: 31, text: "Content Management", icon: Image, href: "/content" },
      { id: 32, text: "Pages", icon: Layers, href: "/pages" },
      { id: 33, text: "Article", icon: FileText, href: "/article" },
    ],
  },
];

export const SuperMenu = [
  { id: 1, text: "Home", icon: Home, href: "/" },
  { id: 2, text: "Users", icon: Users, children: [
    { id: 21, text: "Access", icon: Users, href: "/users" },
  ]},
  {
    id: 3,
    text: "Management",
    icon: Settings,
    children: [
      { id: 31, text: "Services", icon: Settings, href: "/services" },
      { id: 32, text: "Product", icon: Package, href: "/product" },
      { id: 33, text: "Schedule", icon: BarChart3, href: "/schedule" },
      { id: 34, text: "Promotion", icon: Megaphone, href: "/promotion" },
    ],
  },
  {
    id: 4,
    text: "Content",
    icon: Image,
    children: [
      { id: 41, text: "Content Management", icon: Image, href: "/content" },
      { id: 42, text: "Pages", icon: Layers, href: "/pages" },
      { id: 43, text: "Article", icon: FileText, href: "/article" },
    ],
  },
  { id: 5, text: "Career", icon: Briefcase, href: "/career" },
  { id: 6, text: "Metadata", icon: SearchCheck, href: "/metadata" },
];

export const LocalToken = "excutrain_auth_token";
export const LocalRefreshToken = "excutrain_refresh_token";

export const colors = [
  "#00AEEF", // Cyan
  "#D0229F", // Magenta
  "#7C3AED", // Purple
  "#F59E0B", // Orange
  "#EF4444", // Red
  "#10B981", // Green
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#8B5CF6", // Violet
  "#14B8A6", // Teal
  "#F97316", // Deep Orange
  "#06B6D4", // Sky Blue
];
