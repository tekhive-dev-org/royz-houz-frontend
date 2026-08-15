/**
 * Talent Booking Constants & Default Form State
 */

export const BOOKING_STEPS = [
  { id: 1, label: "Your Details" },
  { id: 2, label: "Event Info" },
  { id: 3, label: "Review" },
  { id: 4, label: "Confirmed" },
];

export const INITIAL_BOOKING_DATA = {
  // Step 1: Your Details
  firstName: "",
  lastName: "",
  email: "",
  phone: "",

  // Step 2: Event Info
  eventType: "",
  eventDate: "",
  eventLocation: "",
  eventDescription: "",
  budget: "",

  // Step 3: Review & Agreement
  agreedToTerms: false,

  // Step 4: Confirmation
  bookingReference: "",
};

export const COMMON_EVENT_TYPES = [
  "Corporate Event",
  "Concert / Festival",
  "Wedding / Reception",
  "Private Party / Celebration",
  "Brand Activation / Promotion",
  "Media / TV / Podcast Appearance",
  "Religious / Church Event",
  "Workshop / Masterclass",
  "Club / Lounge Appearance",
  "Other Creative Collaboration",
];
