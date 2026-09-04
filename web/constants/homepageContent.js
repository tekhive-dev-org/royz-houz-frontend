import { LATEST_BLOG_POSTS } from "./blog";
import { UPCOMING_EVENTS } from "./events";
import { FEATURED_MEDIA, MEDIA_HIGHLIGHTS } from "./media";
import { FEATURED_TALENTS } from "./talents";
import { TESTIMONIALS } from "./testimonials";

export const HOMEPAGE_HERO_CONTENT = {
  backgroundImage: "/assets/img/home-hero.png",
  backgroundImageAlt: "African Creatives Concert Background",
  badge: "Welcome to Royz Houz",
  headlineLines: ["BUILDING AFRICA’S", "NEXT GENERATION OF"],
  headlineHighlightLines: ["CREATIVES, LEADERS", "& INNOVATORS"],
  description:
    "We discover. We develop. We empower. Together, we are a legacy that transforms lives and communities.",
  primaryCta: { label: "Explore Talents", href: "/talents" },
  secondaryCta: { label: "Support Our Mission", href: "/about" },
  stats: [
    { value: "500+", label: "Verified Talents" },
    { value: "50+", label: "Projects Delivered" },
    { value: "4.7/5", label: "Platform Rating" },
    { value: "100K+", label: "Lives Impacted" },
  ],
};

export const HOMEPAGE_FEATURED_TALENTS_CONTENT = {
  title: "Featured Talent",
  viewAllLabel: "View all talents",
  viewAllHref: "/talents",
  talents: FEATURED_TALENTS,
};

export const HOMEPAGE_OUR_IMPACT_CONTENT = {
  badge: "OUR IMPACT",
  headline: "Creating Opportunities",
  headlineAccent: "Transforming Lives.",
  description:
    "Through education, mentorship, creative programs and community initiatives, we are empowering the next generation to rise, create and lead.",
  cta: { label: "Support Our Mission", href: "/about" },
  image: "/assets/img/impact.jpg",
  imageAlt: "Empowering African Youth through Education and Mentorship",
  playImage: "/assets/icons/playbtn.png",
  playImageAlt: "Play video",
  videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1",
  videoTitle: "RoyzHouse Impact Story",
  videoAriaLabel: "Play Impact Story Video",
};

export const HOMEPAGE_UPCOMING_EVENTS_CONTENT = {
  title: "Upcoming Events",
  viewAllLabel: "View all events",
  viewAllHref: "/events",
  carouselAriaLabel: "Upcoming events carousel",
  ticketLabel: "Get Ticket",
  events: UPCOMING_EVENTS,
};

export const HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT = {
  title: "Media Highlight",
  viewAllLabel: "View all media",
  viewAllHref: "/media",
  featuredMedia: FEATURED_MEDIA,
  mediaHighlights: MEDIA_HIGHLIGHTS,
};

export const HOMEPAGE_LATEST_BLOG_CONTENT = {
  title: "Latest from our blog",
  viewAllLabel: "View all articles",
  viewAllHref: "/blog",
  carouselAriaLabel: "Latest blog posts carousel",
  posts: LATEST_BLOG_POSTS,
};

export const HOMEPAGE_COMMUNITY_CTA_CONTENT = {
  headline: "JOIN A THRIVING COMMUNITY OF CREATIVES & INNOVATORS GROWING WITH ROYZ HOUZ",
  description:
    "Get weekly insights, talent spotlights, event invites, and opportunities delivered to your inbox.",
  inputPlaceholder: "Enter your email address",
  inputAriaLabel: "Email address",
  submitLabel: "Subscribe",
  successMessage: "🎉 Thank you for subscribing! Check your inbox soon.",
};

export const HOMEPAGE_TESTIMONIALS_CONTENT = {
  badge: "TESTIMONIALS",
  title: "Impact - changing Stories",
  description:
    "Explore the stories and experiences of members who have connected, and found meaningful opportunities.",
  carouselAriaLabel: "Member testimonials carousel",
  testimonials: TESTIMONIALS,
};

export const HOMEPAGE_SUPPORT_MOVEMENT_CONTENT = {
  badge: "SUPPORT THE MOVEMENT",
  headline: "YOUR SUPPORT MAKES A DIFFERENCE TO AFRICA'S CREATIVE FUTURE",
  description:
    "Every donation funds mentorship programmes, creative workshops, and scholarships for Africa's next generation.",
  cta: { label: "Make A Donation", href: "/donate" },
};

export const HOMEPAGE_CONTENT = {
  hero: HOMEPAGE_HERO_CONTENT,
  featuredTalents: HOMEPAGE_FEATURED_TALENTS_CONTENT,
  ourImpact: HOMEPAGE_OUR_IMPACT_CONTENT,
  upcomingEvents: HOMEPAGE_UPCOMING_EVENTS_CONTENT,
  mediaHighlight: HOMEPAGE_MEDIA_HIGHLIGHT_CONTENT,
  latestBlog: HOMEPAGE_LATEST_BLOG_CONTENT,
  communityCta: HOMEPAGE_COMMUNITY_CTA_CONTENT,
  testimonials: HOMEPAGE_TESTIMONIALS_CONTENT,
  supportMovement: HOMEPAGE_SUPPORT_MOVEMENT_CONTENT,
};
