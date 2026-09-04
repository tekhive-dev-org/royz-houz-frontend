import { useState, useMemo, useCallback, useEffect } from "react";
import Head from "next/head";
import {
  EventsHero,
  EventsTabs,
  EventsFilterBar,
  EventsSection,
} from "@/components/events";
import { SupportMovement } from "@/components/home";
import { EVENT_CATEGORIES } from "@/constants/events";
import { listEventCategories, listEvents } from "@/services/content/eventService";

const MONTH_MAP = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function getEventDateTimestamp(ev) {
  const year = parseInt(ev.year || "2026", 10);
  const month = MONTH_MAP[(ev.month || "May").toLowerCase().slice(0, 3)] ?? 4;
  const day = parseInt(ev.day || "1", 10);
  return new Date(year, month, day).getTime();
}

function getEventSections(events) {
  const now = Date.now();
  const pastEvents = events.filter((event) => {
    // An event belongs to Past Events only after it has actually ended.
    // Legacy events without an end time fall back to their start time.
    const endTimestamp = event.ends_at || event.endsAt || event.countdownTarget || event.starts_at;
    const endDate = endTimestamp ? new Date(endTimestamp).getTime() : NaN;
    return event.isPast || (Number.isFinite(endDate) && endDate <= now);
  });
  const upcomingEvents = events.filter((event) => !pastEvents.includes(event));

  return {
    upcoming: upcomingEvents,
    popular: upcomingEvents.filter((event) => event.isPopular),
    past: pastEvents,
  };
}

export default function EventsPage({ events, categories: initialCategories }) {
  const [liveEvents, setLiveEvents] = useState(events || []);
  const [categories, setCategories] = useState(
    initialCategories?.length ? initialCategories : EVENT_CATEGORIES.slice(1).map((title) => ({ title }))
  );
  const eventSections = useMemo(() => getEventSections(liveEvents), [liveEvents]);

  useEffect(() => {
    setLiveEvents(events || []);
    if (initialCategories?.length) setCategories(initialCategories);
  }, [events, initialCategories]);
  const [selectedLocation, setSelectedLocation] = useState("Nigeria");
  const [activeEventsTab, setActiveEventsTab] = useState("upcoming");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-asc");

  // Filter events by selected category and search query
  const filterAndSortEvents = useCallback(
    (eventsList) => {
      // 1. Filter
      const filtered = eventsList.filter((ev) => {
        // Category filter (support category, categoryTag, etc.)
        const cat = (ev.category || "").toLowerCase();
        const tag = (ev.categoryTag || "").toLowerCase();
        const sel = selectedCategory.toLowerCase();
        const matchesCategory =
          selectedCategory === "All" ||
          cat === sel ||
          tag === sel ||
          (sel === "film screening" && tag.includes("film"));

        // Search filter
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          (ev.title || "").toLowerCase().includes(q) ||
          (ev.location || "").toLowerCase().includes(q) ||
          (ev.dateString || "").toLowerCase().includes(q) ||
          (ev.description || "").toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      });

      // 2. Sort
      const sorted = [...filtered];
      switch (sortBy) {
        case "date-asc":
          return sorted.sort(
            (a, b) => getEventDateTimestamp(a) - getEventDateTimestamp(b)
          );
        case "date-desc":
          return sorted.sort(
            (a, b) => getEventDateTimestamp(b) - getEventDateTimestamp(a)
          );
        case "title-asc":
          return sorted.sort((a, b) =>
            (a.title || "").localeCompare(b.title || "")
          );
        case "title-desc":
          return sorted.sort((a, b) =>
            (b.title || "").localeCompare(a.title || "")
          );
        case "popular":
          return sorted.sort(
            (a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)
          );
        default:
          return sorted;
      }
    },
    [selectedCategory, searchQuery, sortBy]
  );

  const filteredUpcoming = useMemo(
    () => filterAndSortEvents(eventSections.upcoming),
    [eventSections.upcoming, filterAndSortEvents]
  );
  const filteredPopular = useMemo(
    () => filterAndSortEvents(eventSections.popular),
    [eventSections.popular, filterAndSortEvents]
  );
  const filteredPast = useMemo(
    () => filterAndSortEvents(eventSections.past),
    [eventSections.past, filterAndSortEvents]
  );

  return (
    <>
      <Head>
        <title>Best Events You Shouldn&apos;t Miss | RoyzHouz</title>
        <meta
          name="description"
          content="Looking for something to do in Nigeria? Explore upcoming creative summits, conferences, festivals, and networking nights."
        />
      </Head>

      <main className="w-full min-h-screen bg-[#FDFCFB]">
        {/* Events Hero Section */}
        <EventsHero
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />

        {/* Sub-Navigation Tabs: Upcoming vs Past */}
        <EventsTabs
          activeTab={activeEventsTab}
          onTabChange={setActiveEventsTab}
        />

        {/* Filter Bar: Categories, Live Search & Production-Ready Sorting */}
        <EventsFilterBar
          categories={["All", ...categories.map((category) => category.title)]}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Content Sections */}
        {activeEventsTab === "upcoming" ? (
          <>
            {/* Upcoming Events Grid */}
            <EventsSection
              title="Upcoming Events"
              events={filteredUpcoming}
              emptyMessage={
                searchQuery
                  ? `No upcoming events found matching "${searchQuery}".`
                  : `No upcoming events found in the "${selectedCategory}" category.`
              }
            />

            {/* Popular Events Grid */}
            <EventsSection
              title="Popular Events"
              events={filteredPopular}
              emptyMessage="No popular events currently listed."
            />
          </>
        ) : (
          /* Past Events Grid */
          <EventsSection
            title="Past Events"
            events={filteredPast}
            isPast={true}
            emptyMessage={
              searchQuery
                ? `No past events found matching "${searchQuery}".`
                : `No past events found in the "${selectedCategory}" category.`
            }
          />
        )}

        {/* Bottom Support Movement Banner */}
        <SupportMovement />
      </main>
    </>
  );
}

export async function getStaticProps() {
  try {
    const [result, categoryResult] = await Promise.all([listEvents(), listEventCategories()]);
    const events = result.success ? result.data : [];

    return {
      props: {
        events,
        categories: categoryResult.success && categoryResult.data.length
          ? categoryResult.data
          : EVENT_CATEGORIES.slice(1).map((title) => ({ title })),
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        events: [],
        categories: [],
      },
      revalidate: 60,
    };
  }
}
