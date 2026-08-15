/**
 * Media Page Constants & Mock Data
 * Central repository for featured hero, videos, podcasts, music spotlight, and gallery photos.
 */

export const MEDIA_FILTER_TABS = [
  { id: "all", label: "All Media" },
  { id: "videos", label: "Videos" },
  { id: "music", label: "Music" },
  { id: "podcasts", label: "Podcasts" },
  { id: "gallery", label: "Gallery" },
];

export const FEATURED_MEDIA = {
  id: "featured-home",
  category: "DOCUMENTARY",
  title: "Echoes of the North: The Making of Royz Houz",
  duration: "24 mins",
  views: "12.4k views",
  image: "/assets/img/talent-hero.jpg",
  watchLink: "/media/watch/beyond-the-stage",
  author: {
    name: "Royz Production",
    avatar: "/assets/img/talents/david.jpg",
  },
};

export const MEDIA_HIGHLIGHTS = [
  {
    id: "highlight-1",
    title: "Behind The Scenes: Rising Stars Live Session 2025",
    author: "Royz Studios",
    duration: "12:45",
    image: "/assets/img/about/gallery/gallery-4.jpg",
    link: "/media/watch/video-1",
  },
  {
    id: "highlight-2",
    title: "Studio Sessions: The Making of 'Lagos Nights'",
    author: "Creative Team",
    duration: "08:20",
    image: "/assets/img/talents/producer-hero.jpg",
    link: "/media/watch/video-2",
  },
  {
    id: "highlight-3",
    title: "In Conversation: Navigating Africa's Creative Economy",
    author: "Industry Voices",
    duration: "18:10",
    image: "/assets/img/about/gallery/gallery-1.jpg",
    link: "/media/watch/video-3",
  },
];

export const FEATURED_HERO_MEDIA = {
  badge: "FEATURED NOW",
  title: "BEYOND THE STAGE:",
  highlightTitle: "STORIES OF RESILIENCE\nAND EXCELLENCE.",
  description:
    "We discover. We develop. We empower. Together, we are a legacy that transforms lives and communities.",
  author: {
    name: "Amara Nwosu",
    avatar: "/assets/img/talents/david.jpg",
  },
  duration: "22:45",
  views: "440K views",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  bgImage: "/assets/img/talent-hero.jpg",
};

const BASE_VIDEOS = [
  {
    id: "video-1",
    title: "The Beat Behind the Hit",
    subtitle: "Producer Spotlight: Jaysmith",
    duration: "4:32",
    thumbnail: "/assets/img/about/gallery/gallery-4.jpg",
    author: {
      name: "John Donald",
      avatar: "/assets/img/talents/charles.jpg",
    },
    views: "980K views",
    publishedAt: "2 days ago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "video-2",
    title: "Creative Women Rising",
    subtitle: "A conversation with Mide Martins",
    duration: "4:32",
    thumbnail: "/assets/img/talents/fatima.jpg",
    author: {
      name: "Alexia Bradley",
      avatar: "/assets/img/talents/zara.jpg",
    },
    views: "650K views",
    publishedAt: "4 days ago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "video-3",
    title: "Rhythm Without Borders",
    subtitle: "Blessing Moses Live in Lagos",
    duration: "4:32",
    thumbnail: "/assets/img/events/event1.jpg",
    author: {
      name: "Benjamin Adams",
      avatar: "/assets/img/talents/amara.jpg",
    },
    views: "500K views",
    publishedAt: "5 days ago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "video-4",
    title: "Soundscapes of Nigeria",
    subtitle: "Documentary Film Screening",
    duration: "6:15",
    thumbnail: "/assets/img/about/gallery/gallery-2.jpg",
    author: {
      name: "John Donald",
      avatar: "/assets/img/talents/charles.jpg",
    },
    views: "980K views",
    publishedAt: "2 days ago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "video-5",
    title: "The Art of Choreography",
    subtitle: "Masterclass with Royz Dance Crew",
    duration: "5:20",
    thumbnail: "/assets/img/about/moments.jpg",
    author: {
      name: "Alexia Bradley",
      avatar: "/assets/img/talents/zara.jpg",
    },
    views: "650K views",
    publishedAt: "4 days ago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "video-6",
    title: "Afro-Fusion Symphony",
    subtitle: "Live Orchestra Performance",
    duration: "8:40",
    thumbnail: "/assets/img/talents/guitar.jpg",
    author: {
      name: "Benjamin Adams",
      avatar: "/assets/img/talents/amara.jpg",
    },
    views: "500K views",
    publishedAt: "5 days ago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "video-7",
    title: "Studio Sessions Unplugged",
    subtitle: "Acoustic Sets from Royz Studio",
    duration: "4:12",
    thumbnail: "/assets/img/media/media_studio.jpg",
    author: {
      name: "John Donald",
      avatar: "/assets/img/talents/charles.jpg",
    },
    views: "980K views",
    publishedAt: "2 days ago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "video-8",
    title: "Voices of Africa",
    subtitle: "Poetry and Spoken Word Showcase",
    duration: "3:50",
    thumbnail: "/assets/img/about/gallery/gallery-5.jpg",
    author: {
      name: "Alexia Bradley",
      avatar: "/assets/img/talents/zara.jpg",
    },
    views: "650K views",
    publishedAt: "4 days ago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "video-9",
    title: "Live Concert Highlights",
    subtitle: "Royz Houz Annual Fest 2026",
    duration: "9:15",
    thumbnail: "/assets/img/about/gallery/gallery-3.jpg",
    author: {
      name: "Benjamin Adams",
      avatar: "/assets/img/talents/amara.jpg",
    },
    views: "500K views",
    publishedAt: "5 days ago",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

// Generate 54 realistic items across 6 pages of 9 items
export const MEDIA_VIDEOS = Array.from({ length: 54 }, (_, i) => {
  const base = BASE_VIDEOS[i % BASE_VIDEOS.length];
  const pageNum = Math.floor(i / 9) + 1;
  return {
    ...base,
    id: `video-${i + 1}`,
    title: pageNum === 1 ? base.title : `${base.title} (Vol. ${pageNum})`,
  };
});

export const MEDIA_BEYOND_SPOTLIGHT_PODCASTS = [
  {
    id: "spotlight-1",
    category: "CULTURE",
    title: "The Creative Hustle — Ep. 24: Making It In Lagos",
    host: "with Amara Nwosu",
    duration: "54:12",
    thumbnail: "/assets/img/media/media_studio.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "spotlight-2",
    category: "INSPIRATION",
    title: "Africa to the World — Ep. 12: Cinema Without Borders",
    host: "with Gabriel Peters",
    duration: "48:30",
    thumbnail: "/assets/img/talents/producer-video-frame.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    id: "spotlight-3",
    category: "BUSINESS",
    title: "Style Stories — Ep. 8: The Future of African Fashion",
    host: "with Zara Diallo",
    duration: "41:55",
    thumbnail: "/assets/img/talents/producer-hero.jpg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

const BASE_PODCASTS = [
  {
    id: "podcast-1",
    title: "Turning Personal Stories Into Powerful Art",
    description: "Building a career without losing your identity",
    host: "Daniel Okore",
    duration: "4:32",
    views: "980K views",
    publishedAt: "2 days ago",
    thumbnail: "/assets/img/media/media_studio.jpg",
    audioUrl: "#",
  },
  {
    id: "podcast-2",
    title: "Turning Your Talent Into a Sustainable Career",
    description: "Building a career without losing your identity",
    host: "Godson Jenneth",
    duration: "4:32",
    views: "980K views",
    publishedAt: "2 days ago",
    thumbnail: "/assets/img/talents/producer-hero.jpg",
    audioUrl: "#",
  },
  {
    id: "podcast-3",
    title: "Keeping African Traditions Alive Through Art",
    description: "Building a career without losing your identity",
    host: "Stanley Okoro",
    duration: "4:32",
    views: "980K views",
    publishedAt: "2 days ago",
    thumbnail: "/assets/img/talents/guitar.jpg",
    audioUrl: "#",
  },
  {
    id: "podcast-4",
    title: "Finding Your Voice in a Crowded Industry",
    description: "Building a career without losing your identity",
    host: "Njoku Nwosu",
    duration: "4:32",
    views: "980K views",
    publishedAt: "2 days ago",
    thumbnail: "/assets/img/about/gallery/gallery-5.jpg",
    audioUrl: "#",
  },
  {
    id: "podcast-5",
    title: "Preserving Culture Through Modern Creativity",
    description: "Building a career without losing your identity",
    host: "Femi Daniels",
    duration: "4:32",
    views: "980K views",
    publishedAt: "2 days ago",
    thumbnail: "/assets/img/talents/headphones.jpg",
    audioUrl: "#",
  },
  {
    id: "podcast-6",
    title: "How Technology is Transforming African Creativity",
    description: "Building a career without losing your identity",
    host: "Njoku Nwosu",
    duration: "4:32",
    views: "980K views",
    publishedAt: "2 days ago",
    thumbnail: "/assets/img/about/moments.jpg",
    audioUrl: "#",
  },
];

// Generate 36 realistic podcast episodes across 6 pages of 6 items
export const MEDIA_PODCASTS = Array.from({ length: 36 }, (_, i) => {
  const base = BASE_PODCASTS[i % BASE_PODCASTS.length];
  const pageNum = Math.floor(i / 6) + 1;
  return {
    ...base,
    id: `podcast-${i + 1}`,
    title: pageNum === 1 ? base.title : `${base.title} (Part ${pageNum})`,
  };
});

export const MEDIA_DISCOVER_SOUNDS = [
  {
    id: "discover-1",
    title: "Echoes of Home",
    genre: "Afro-Pop/R&B",
    artist: "Benjamin Alison",
    coverImage: "/assets/img/talents/guitar.jpg",
    audioUrl: "#",
  },
  {
    id: "discover-2",
    title: "Vibes & Patterns",
    genre: "Afrobeats / Dancehall",
    artist: "Godson Longshore",
    coverImage: "/assets/img/events/event1.jpg",
    audioUrl: "#",
  },
  {
    id: "discover-3",
    title: "One Africa",
    genre: "Afro-R&B",
    artist: "Goodness Anderson",
    coverImage: "/assets/img/about/gallery/gallery-6.jpg",
    audioUrl: "#",
  },
];

const BASE_ALL_MUSIC_TRACKS = [
  {
    id: "all-track-1",
    title: "New Beginnings",
    genre: "R&B / Soul",
    artist: "Lena Bassey",
    coverImage: "/assets/img/talents/upnext-beautiful-chaos.jpg",
    audioUrl: "#",
  },
  {
    id: "all-track-2",
    title: "Home Again",
    genre: "Afrobeats / Dancehall",
    artist: "Rita Nkem",
    coverImage: "/assets/img/talents/producer-hero.jpg",
    audioUrl: "#",
  },
  {
    id: "all-track-3",
    title: "Midnight Calling",
    genre: "Afro-Pop/R&B",
    artist: "Seyi Mars",
    coverImage: "/assets/img/talents/upnext-new-beginnings.jpg",
    audioUrl: "#",
  },
  {
    id: "all-track-4",
    title: "No Pressure",
    genre: "R&B / Soul",
    artist: "Kelvin Daze",
    coverImage: "/assets/img/about/gallery/gallery-5.jpg",
    audioUrl: "#",
  },
  {
    id: "all-track-5",
    title: "Sweet Escape",
    genre: "Afro-Pop/R&B",
    artist: "Nia Okafor",
    coverImage: "/assets/img/talents/producer-video-frame.jpg",
    audioUrl: "#",
  },
  {
    id: "all-track-6",
    title: "Oceans Apart",
    genre: "R&B / Soul",
    artist: "Tee Brown",
    coverImage: "/assets/img/about/gallery/gallery-1.jpg",
    audioUrl: "#",
  },
  {
    id: "all-track-7",
    title: "Golden Hour",
    genre: "Afrobeats / Dancehall",
    artist: "Mira Essien",
    coverImage: "/assets/img/talents/upnext-golden-hour.jpg",
    audioUrl: "#",
  },
  {
    id: "all-track-8",
    title: "Energy",
    genre: "Afro-Pop/R&B",
    artist: "Kora Tribe",
    coverImage: "/assets/img/about/gallery/gallery-6.jpg",
    audioUrl: "#",
  },
];

// Generate 48 realistic music tracks across 6 pages of 8 items
export const MEDIA_ALL_MUSIC_TRACKS = Array.from({ length: 48 }, (_, i) => {
  const base = BASE_ALL_MUSIC_TRACKS[i % BASE_ALL_MUSIC_TRACKS.length];
  const pageNum = Math.floor(i / 8) + 1;
  return {
    ...base,
    id: `all-track-${i + 1}`,
    title: pageNum === 1 ? base.title : `${base.title} (Mix ${pageNum})`,
  };
});

export const MEDIA_MUSIC_SPOTLIGHT = {
  featuredTrack: {
    id: "featured-track",
    title: "Echoes of Home",
    genre: "Afro-Pop/R&B",
    artist: "Benjamin Alison",
    duration: "4:35",
    coverImage: "/assets/img/events/event1.jpg",
    audioUrl: "#",
  },
  tracks: [
    {
      id: "track-1",
      title: "Beautiful Chaos",
      genre: "Afrobeats / Dancehall",
      artist: "Lena Bassey",
      coverImage: "/assets/img/talents/upnext-beautiful-chaos.jpg",
      audioUrl: "#",
    },
    {
      id: "track-2",
      title: "Oceans Apart",
      genre: "R&B / Soul",
      artist: "Tee Brown",
      coverImage: "/assets/img/talents/producer-hero.jpg",
      audioUrl: "#",
    },
    {
      id: "track-3",
      title: "New Beginnings",
      genre: "Afro-fusion",
      artist: "Nia Okafor",
      coverImage: "/assets/img/talents/upnext-new-beginnings.jpg",
      audioUrl: "#",
    },
    {
      id: "track-4",
      title: "Midnight Calling",
      genre: "Highlife / Afro-soul",
      artist: "Kora Tribe",
      coverImage: "/assets/img/talents/producer-video-frame.jpg",
      audioUrl: "#",
    },
    {
      id: "track-5",
      title: "Higher Ground",
      genre: "Afropop / R&B",
      artist: "Mira Essien",
      coverImage: "/assets/img/about/gallery/gallery-1.jpg",
      audioUrl: "#",
    },
    {
      id: "track-6",
      title: "Oceans Apart",
      genre: "Afro-Pop/R&B",
      artist: "Dami Vee",
      coverImage: "/assets/img/talents/upnext-golden-hour.jpg",
      audioUrl: "#",
    },
  ],
};

export const MEDIA_GALLERY_COLUMNS = [
  [
    {
      id: "photo-1",
      title: "Live Concert Energy",
      image: "/assets/img/about/gallery/gallery-1.jpg",
      alt: "Live concert crowd and illuminated stage",
      size: "tall",
    },
    {
      id: "photo-4",
      title: "Traditional Dance Expression",
      image: "/assets/img/about/gallery/gallery-4.jpg",
      alt: "Contemporary dancers leaping across the stage",
      size: "short",
    },
    {
      id: "photo-7",
      title: "Festival Lights & Energy",
      image: "/assets/img/events/event2.jpg",
      alt: "Live stage with bright beam lights and massive crowd",
      size: "tall",
    },
  ],
  [
    {
      id: "photo-2",
      title: "Ballet Ensemble",
      image: "/assets/img/about/gallery/gallery-2.jpg",
      alt: "Ballet dancers performing Swan Lake ensemble",
      size: "short",
    },
    {
      id: "photo-5",
      title: "Mic Check & Rap Flow",
      image: "/assets/img/about/gallery/gallery-5.jpg",
      alt: "Artist performing live with microphone and sunglasses",
      size: "tall",
    },
    {
      id: "photo-8",
      title: "Runway & Exhibition",
      image: "/assets/img/media/media_fashion.jpg",
      alt: "Fashion and performance exhibition in purple neon light",
      size: "short",
    },
  ],
  [
    {
      id: "photo-3",
      title: "Solo Spotlight",
      image: "/assets/img/about/gallery/gallery-3.jpg",
      alt: "Theatrical actress in white dress under spotlight",
      size: "short",
    },
    {
      id: "photo-6",
      title: "Crowd Euphoria",
      image: "/assets/img/about/gallery/gallery-6.jpg",
      alt: "Concert festival crowd raising hands in celebration",
      size: "extraTall",
    },
    {
      id: "photo-9",
      title: "Acoustic Soul & Glow",
      image: "/assets/img/about/moments.jpg",
      alt: "Electric guitarist under warm amber smoke and spotlight",
      size: "tall",
    },
  ],
];

const BASE_GALLERY_FLAT = MEDIA_GALLERY_COLUMNS.flat();

// Generate 54 realistic gallery photos across 6 pages of 9 items
export const MEDIA_GALLERY_PHOTOS = Array.from({ length: 54 }, (_, i) => {
  const base = BASE_GALLERY_FLAT[i % BASE_GALLERY_FLAT.length];
  const pageNum = Math.floor(i / 9) + 1;
  return {
    ...base,
    id: `photo-${i + 1}`,
    title: pageNum === 1 ? base.title : `${base.title} (Frame ${pageNum})`,
  };
});
