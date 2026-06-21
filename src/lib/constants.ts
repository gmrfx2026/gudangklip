export const PLATFORMS = [
  { value: "TIKTOK", label: "TikTok", color: "#000000" },
  { value: "INSTAGRAM", label: "Instagram", color: "#E4405F" },
  { value: "YOUTUBE", label: "YouTube", color: "#FF0000" },
] as const;

export const CATEGORIES = [
  { value: "MUSIC", label: "Music" },
  { value: "FILM", label: "Film" },
  { value: "BRAND", label: "Brand" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
] as const;

export const ROLES = [
  { value: "BRAND", label: "Brand" },
  { value: "CREATOR", label: "Creator" },
  { value: "AGENCY", label: "Agency" },
  { value: "ADMIN", label: "Admin" },
] as const;

export const DEFAULT_CPM = 3000;
export const MIN_WITHDRAW = 50000;
export const MIN_TOPUP = 10000;
export const MAX_TOPUP = 100000000;
export const TRUST_SCORE_THRESHOLDS = {
  BRONZE: 30,
  SILVER: 60,
  GOLD: 85,
} as const;

export const SIDEBAR_LINKS = {
  BRAND: [
    { href: "/brand", label: "Overview", icon: "LayoutDashboard" },
    { href: "/brand/campaigns", label: "Campaigns", icon: "Megaphone" },
    { href: "/brand/analytics", label: "Analytics", icon: "BarChart3" },
  ],
  CREATOR: [
    { href: "/creator", label: "Overview", icon: "LayoutDashboard" },
    { href: "/creator/explore", label: "Explore Campaigns", icon: "Search" },
    { href: "/creator/campaigns", label: "My Campaigns", icon: "FolderOpen" },
    { href: "/creator/submissions", label: "Submissions", icon: "Video" },
    { href: "/creator/wallet", label: "Wallet", icon: "Wallet" },
  ],
  AGENCY: [
    { href: "/agency", label: "Overview", icon: "LayoutDashboard" },
    { href: "/agency/members", label: "Members", icon: "Users" },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", icon: "LayoutDashboard" },
    { href: "/admin/users", label: "Users", icon: "Users" },
    { href: "/admin/payouts", label: "Payouts", icon: "Banknote" },
  ],
} as const;
