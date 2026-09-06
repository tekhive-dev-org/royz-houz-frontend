export const DEFAULT_DONATION_PAGE_CONTENT = {
  seo: {
    title: "Donate & Empower African Creatives — Royz House",
    description:
      "Together we can create opportunities and change lives. Support young African creatives and talents through Royz House foundation.",
    ogImage: "/assets/img/donate-hero.jpg",
  },
  hero: {
    badge: "DONATION",
    headlinePart1: "TOGETHER WE CAN CREATE",
    headlineAccent1: "OPPORTUNITIES",
    headlinePart2: "& CHANGE",
    headlineAccent2: "LIVES",
    description:
      "Your Support not just only empowers talents but also creates more opportunities and builds a better future.",
    image: "/assets/img/donate-hero.jpg",
  },
  giving: {
    title: "Make A Donation",
    subtitle: "Choose how you would like to give.",
    currency: "NGN",
    currencySymbol: "₦",
    presetAmounts: [15000, 25000, 35000, 45000],
    defaultAmount: 25000,
    frequencies: [
      { id: "one-time", label: "One-time Donation" },
      { id: "monthly", label: "Monthly Donation" },
      { id: "sponsor", label: "Sponsor a Talent" },
    ],
    securityNote: "Your donation is secured and encrypted.",
  },
  review: {
    title: "Review Your Donation",
    subtitle: "Please confirm your donation details before proceedings to secure payment.",
    trustTitle: "Your Donation is Secured",
    trustDescription: "We use industry-standard security and paystack to process your payment safely.",
    pendingNotice: "Your request will remain pending until payment is verified.",
  },
  confirmation: {
    badge: "Donation Request Received",
    title: "Thank You for Your Generosity!",
    subtitle:
      "Your donation request is pending payment verification. We'll contact you with next steps.",
    impactText:
      "100% of your contribution goes directly towards equipment, training programs, and mentorship for emerging creative talents across Africa.",
    disclaimer: "Payment is not confirmed until it has been verified by Royz House.",
  },
};
