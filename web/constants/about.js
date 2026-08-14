import { MissionTargetIcon, VisionEyeIcon } from "@/components/about/WhyChooseUs/Icons";

export const MISSION_VISION_CARDS = [
  {
    id: "mission",
    title: "Our Mission",
    description:
      "To discover, develop, and empower creatives through meaningful opportunities, collaboration, and experiences that create positive change in communities.",
    icon: MissionTargetIcon,
  },
  {
    id: "vision",
    title: "Our Vision",
    description:
      "To become a leading platform where aspiring creatives access opportunities, mentorship, and support that inspire growth, innovation, and lasting impact.",
    icon: VisionEyeIcon,
  },
];

export const IMPACT_METRICS = [
  {
    id: "talent-discovery",
    title: "Talent Discovery",
    percentage: 94,
    description:
      "Discover exceptional African creatives and connect with talented individuals whose skills, passion, and unique stories deserve to be seen.",
  },
  {
    id: "creative-development",
    title: "Creative Development",
    percentage: 89,
    description:
      "We support creatives with meaningful opportunities, guidance, and connections that help them develop their skills and grow their careers.",
  },
  {
    id: "meaningful-impact",
    title: "Meaningful Impact",
    percentage: 86,
    description:
      "From creative opportunities to community initiatives, we create experiences that empower people and contribute to lasting positive change.",
  },
];

export const MOMENTS_FEATURES = [
  {
    id: "discovery",
    title: "Creative Talent Discovery",
    description:
      "Discover exceptional African creatives and explore their unique talents, stories, and journeys.",
    iconName: "TalentDiscovery",
    darkBadge: false,
  },
  {
    id: "development",
    title: "Talent Development",
    description:
      "Access meaningful opportunities, mentorship, and support designed to help creatives grow.",
    iconName: "Sprout",
    darkBadge: true,
  },
  {
    id: "opportunities",
    title: "Creative Opportunities",
    description:
      "Connect talented individuals with events, collaborations, projects, and career opportunities.",
    iconName: "Handshake",
    darkBadge: false,
  },
  {
    id: "impact",
    title: "Community Impact",
    description:
      "Be part of a growing movement creating positive change through creativity, education, and empowerment.",
    iconName: "Heart",
    darkBadge: true,
  },
];

export const ABOUT_GALLERY_COLUMNS = [
  [
    {
      id: "gallery-1",
      title: "Cultural Heritage & Community",
      image: "/assets/img/about/gallery/gallery-1.jpg",
      alt: "African women in traditional headwraps and cultural attire",
      size: "tall",
    },
    {
      id: "gallery-4",
      title: "Festive Celebration & Unity",
      image: "/assets/img/about/gallery/gallery-4.jpg",
      alt: "Women in traditional white Habesha Kemis dresses celebrating cultural festival",
      size: "short",
    },
  ],
  [
    {
      id: "gallery-2",
      title: "Vibrant Dance & Expression",
      image: "/assets/img/about/gallery/gallery-2.jpg",
      alt: "African cultural dancers performing energetically outdoors",
      size: "short",
    },
    {
      id: "gallery-5",
      title: "Live Musical Performance",
      image: "/assets/img/about/gallery/gallery-5.jpg",
      alt: "Afrobeats artist singing on stage with microphone and sunglasses",
      size: "tall",
    },
  ],
  [
    {
      id: "gallery-3",
      title: "Regal Traditions & Leadership",
      image: "/assets/img/about/gallery/gallery-3.jpg",
      alt: "Distinguished African elder in ceremonial royal robes and headdress",
      size: "short",
    },
    {
      id: "gallery-6",
      title: "Concert Spotlight & Energy",
      image: "/assets/img/about/gallery/gallery-6.jpg",
      alt: "Live concert performance with electric guitarist under stage lights",
      size: "extraTall",
    },
  ],
];

export const ABOUT_GALLERY_ITEMS = ABOUT_GALLERY_COLUMNS.flat();
