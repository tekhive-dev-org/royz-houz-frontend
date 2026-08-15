/**
 * Talent Application Constants & Default Options
 */

export const APPLICATION_STEPS = [
  { id: 1, label: "Personal Information", key: "personal" },
  { id: 2, label: "Talent & Experience", key: "talent" },
  { id: 3, label: "Portfolio & Socials", key: "portfolio" },
  { id: 4, label: "Availability & Booking", key: "availability" },
  { id: 5, label: "Review & Submit", key: "review" },
];

export const TALENT_CATEGORIES = [
  { id: "musician", label: "Musician" },
  { id: "actor", label: "Actor" },
  { id: "producer", label: "Producer" },
  { id: "dancer", label: "Dancer" },
  { id: "influencer", label: "Influencer" },
  { id: "writer", label: "Writer" },
  { id: "custom", label: "Custom", isCustom: true },
];

export const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "emerging", label: "Emerging Talent" },
  { id: "intermediate", label: "Intermediate" },
  { id: "professional", label: "Professional" },
  { id: "established", label: "Established" },
];

export const YEARS_OF_EXPERIENCE = [
  { id: "less_1", label: "Less than 1 year" },
  { id: "1_2", label: "1–2 years" },
  { id: "3_5", label: "3–5 years" },
  { id: "6_10", label: "6–10 years" },
  { id: "10_plus", label: "10+ years" },
];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara", "Other / International"
];

export const SOCIAL_PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: "instagram", prefix: "https://instagram.com/" },
  { id: "twitter", name: "X / Twitter", icon: "twitter", prefix: "https://x.com/" },
  { id: "tiktok", name: "TikTok", icon: "tiktok", prefix: "https://tiktok.com/@" },
  { id: "youtube", name: "YouTube", icon: "youtube", prefix: "https://youtube.com/@" },
  { id: "whatsapp", name: "Whatsapp", icon: "whatsapp", prefix: "https://wa.me/" },
  { id: "facebook", name: "Facebook", icon: "facebook", prefix: "https://facebook.com/" },
  { id: "github", name: "GitHub", icon: "github", prefix: "https://github.com/" },
  { id: "linkedin", name: "LinkedIn", icon: "linkedin", prefix: "https://linkedin.com/in/" },
  { id: "pinterest", name: "Pinterest", icon: "pinterest", prefix: "https://pinterest.com/" },
  { id: "others", name: "Others", icon: "others", isOther: true },
];

export const OPPORTUNITY_TYPES = [
  { id: "events", title: "Events", subtitle: "Live events, concerts and shows" },
  { id: "performances", title: "Performances", subtitle: "Stage, live performance" },
  { id: "media_features", title: "Media Features", subtitle: "Interviews, TV, Radio and Podcasts" },
  { id: "brand_collabs", title: "Brand Collaborations", subtitle: "Influencer, ambassador and campaigns" },
  { id: "speaking_workshops", title: "Speaking/ Workshop", subtitle: "Talks, Workshops and Trainings" },
  { id: "commercial_projects", title: "Commercial Projects", subtitle: "Ads, commercials and promotions" },
  { id: "creative_collabs", title: "Creative Collaborations", subtitle: "Features, Songwriting and Production" },
  { id: "other_opps", title: "Other", subtitle: "Other Opportunities" },
];

export const GENERAL_AVAILABILITY_OPTIONS = [
  { id: "weekdays", label: "Weekdays" },
  { id: "weekends", label: "Weekends" },
  { id: "both", label: "Both weekends & weekdays" },
  { id: "flexible", label: "Flexible / Varies" },
];

export const ENGAGEMENT_TYPES = [
  { id: "in_person", label: "In-person", subtitle: "On-site/physical engagements" },
  { id: "remote", label: "Remote", subtitle: "Online/virtual engagements" },
  { id: "both", label: "Both", subtitle: "In-person or remote" },
];

export const WORK_LOCATION_OPTIONS = [
  { id: "city_only", label: "My city/local area only", subtitle: "I only work within my city or local area" },
  { id: "nigeria", label: "Anywhere in Nigeria", subtitle: "I can work anywhere in Nigeria" },
  { id: "international", label: "Internationally", subtitle: "I'm available for international opportunities" },
  { id: "remote_only", label: "Remote/ Online only", subtitle: "I only work remotely" },
];

export const INITIAL_FORM_DATA = {
  // Step 1: Personal Info
  fullName: "John Doe",
  stageName: "Tee-bay",
  phoneNumber: "080 - 764 - 6741",
  dateOfBirth: "1996-05-12",
  emailAddress: "Johndoe@example.com",
  stateRegion: "Enugu",
  profilePhoto: null,
  profilePhotoPreview: "/assets/img/talents/david.jpg",

  // Step 2: Talent & Experience
  talentCategory: "Musician",
  customTalentCategory: "",
  experienceLevel: "Intermediate",
  yearsOfExperience: "1–2 years",
  shortBio: "Versatile vocalist and songwriter passionate about creating impactful music that connects people.",
  genresSpecialties: "Afrobeats, R&B, Soul",

  // Step 3: Portfolio & Socials
  socialProfiles: [
    { id: "sp-1", platform: "Instagram", url: "https://instagram.com/johndoe" },
    { id: "sp-2", platform: "TikTok", url: "https://tiktok.com/@johndoe" },
    { id: "sp-3", platform: "X / Twitter", url: "https://x.com/johndoe" },
    { id: "sp-4", platform: "YouTube", url: "https://youtube.com/@johndoe" },
    { id: "sp-5", platform: "Facebook", url: "https://facebook.com/johndoe" },
  ],
  otherPlatformUrl: "https://www.johndoe.com",
  workSamples: [
    { id: "ws-1", name: "Ballet Solo.jpg", type: "image", size: "3.2 MB", thumbnail: "/assets/img/talents/dancer.jpg" },
    { id: "ws-2", name: "Sunset Choreography.jpg", type: "image", size: "4.8 MB", thumbnail: "/assets/img/events/event2.jpg" },
    { id: "ws-3", name: "Live Performance Reel.mp4", type: "video", size: "18.2 MB", thumbnail: "/assets/img/events/event1.jpg" },
    { id: "ws-4", name: "Official Press Kit 2026.pdf", type: "pdf", size: "2.1 MB" },
  ],

  // Step 4: Availability & Booking
  interestedInBookings: "yes", // 'yes' | 'no'
  opportunities: ["events", "performances", "media_features", "brand_collabs", "creative_collabs"],
  generalAvailability: "both",
  preferredEngagement: "in_person",
  workLocations: ["nigeria"],

  // Step 5: Additional info & consent
  languages: "English, Hausa, Yoruba",
  equipmentResources: "Home Studio, Recording Equipments, Microphone",
  achievements: ["Winner, Next Rated Awards 2024", "Featured on Apple Music New Artist Spotlight 2026"],
  references: "Available upon request",
  confirmedAccuracy: true,
};
