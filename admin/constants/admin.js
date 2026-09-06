export const ADMIN_NAVIGATION = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: "dashboard", group: "Workspace" },
  { id: "website", label: "Website", href: "/website", icon: "language", group: "Workspace" },
  { id: "homepage", label: "Homepage", href: "/homepage", icon: "home", group: "Content" },
  { id: "about", label: "About", href: "/about", icon: "info", group: "Content" },
  { id: "talents", label: "Talents", href: "/talents", icon: "people", group: "Content" },
  { id: "events", label: "Events", href: "/events", icon: "event", group: "Content" },
  { id: "blog", label: "Blog", href: "/blog", icon: "article", group: "Content" },
  { id: "media", label: "Media Content", href: "/media", icon: "media", group: "Content" },
  { id: "seo", label: "SEO", href: "/seo", icon: "search", group: "Content" },
  { id: "donations", label: "Donations", href: "/donations", icon: "donations", group: "Operations" },
  { id: "payments", label: "Ticket Payments", href: "/payments", icon: "payments", group: "Operations" },
  { id: "contacts", label: "Contacts", href: "/contacts", icon: "contacts", group: "Operations" },
  { id: "newsletter", label: "Newsletter", href: "/newsletter", icon: "newsletter", group: "Operations" },
  { id: "reports", label: "Content Reports", href: "/reports", icon: "reports", group: "Operations" },
  { id: "bookings", label: "Talent Bookings", href: "/bookings", icon: "bookings", group: "Operations" },
  { id: "join-applications", label: "Join Applications", href: "/join-applications", icon: "applications", group: "Operations" },
  { id: "users-and-roles", label: "Users and Roles", href: "/users-and-roles", icon: "security", group: "Administration" },
  { id: "audit-logs", label: "Audit Logs", href: "/audit-logs", icon: "audit", group: "Administration" },
  { id: "merchandise", label: "Merchandise", href: "/merchandise", icon: "store", group: "Administration" },
  { id: "settings", label: "Settings", href: "/settings", icon: "settings", group: "Administration" },
];

export const ADMIN_NAVIGATION_GROUPS = ["Workspace", "Content", "Operations", "Administration"];

export const ADMIN_FOUNDATION_STATUS = {
  label: "Dashboard shell ready",
  description: "Navigation, feedback, and protected-route foundations are ready for future admin modules.",
};
