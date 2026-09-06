export const ADMIN_FEATURES = {
  website: {
    label: "Website",
    description: "Website-wide content and global settings.",
    readPermission: "settings.read",
  },
  homepage: {
    label: "Homepage",
    description: "Homepage sections, placements, and hero content.",
    readPermission: "homepage.read",
  },
  about: {
    label: "About",
    description: "About page sections, gallery, and moments.",
    readPermission: "homepage.read",
  },
  talents: {
    label: "Talents",
    description: "Talent profiles, categories, and media.",
    readPermission: "talents.create",
  },
  events: {
    label: "Events",
    description: "Events, categories, and scheduling.",
    readPermission: "events.create",
  },
  blog: {
    label: "Blog",
    description: "Posts, authors, categories, and publishing.",
    readPermission: "blog.create",
  },
  comments: {
    label: "Comments",
    description: "Comment moderation and review.",
    readPermission: "comments.moderate",
  },
  media: {
    label: "Media",
    description: "Media assets, collections, and uploads.",
    readPermission: "media.upload",
  },
  donations: {
    label: "Donations",
    description: "Donation campaigns and records.",
    readPermission: "donations.read",
  },
  contacts: {
    label: "Contacts",
    description: "Contact submissions and workflow.",
    readPermission: "contacts.read",
  },
  payments: {
    label: "Ticket Payments",
    description: "Event ticket orders and Paystack payment records.",
    readPermission: "events.create",
  },
  newsletter: {
    label: "Newsletter",
    description: "Newsletter subscribers and audience status.",
    readPermission: "contacts.read",
  },
  reports: {
    label: "Content Reports",
    description: "Public content report review and moderation.",
    readPermission: "reports.read",
  },
  bookings: {
    label: "Talent Bookings",
    description: "Private booking requests and workflow.",
    readPermission: "bookings.read",
  },
  "join-applications": {
    label: "Join Applications",
    description: "Talent and join application review.",
    readPermission: "applications.read",
  },
  seo: {
    label: "SEO",
    description: "Search metadata and indexing.",
    readPermission: "settings.read",
  },
  "users-and-roles": {
    label: "Users and Roles",
    description: "Administrative users, roles, and permissions.",
    readPermission: "users.manage",
  },
  "audit-logs": {
    label: "Audit Logs",
    description: "Administrative audit and publishing activity.",
    readPermission: "audit.read",
  },
  settings: {
    label: "Settings",
    description: "Administration preferences and configuration.",
    readPermission: "settings.read",
  },
};
