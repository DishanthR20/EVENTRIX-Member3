
"use client";

import {
  Suspense,
  useMemo,
  useState,
  useSyncExternalStore,
  useEffect,
} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import { getPublishedEvents } from "@/lib/events-api";

type EventItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "Online" | "Offline" | "Hybrid";
  date: string;
  time: string;
  city: string;
  venue: string;
  price: number;
  banner: string;
  status: "PUBLISHED";
};

const categories = [
  "All Categories",
  "Technology",
  "Business",
  "Music",
  "Education",
  "Arts",
  "Sports",
];

const eventTypes = ["All Types", "Online", "Offline", "Hybrid"];
const priceOptions = ["All Prices", "Free Events", "Paid Events"];
const statusOptions = ["All Events", "Upcoming Events", "Past Events"];

const ITEMS_PER_PAGE = 6;

function subscribeToNothing() {
  return () => {};
}

function getTodaySnapshot() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getServerTodaySnapshot() {
  return "";
}

function EventsContent() {
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") ?? "";
  const initialCategory = searchParams.get("category") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [category, setCategory] = useState(
    categories.includes(initialCategory) && initialCategory !== "All Categories"
      ? initialCategory
      : "All Categories"
  );

  const [eventType, setEventType] = useState("All Types");
  const [selectedDate, setSelectedDate] = useState("");
  const [location, setLocation] = useState("All Locations");
  const [priceFilter, setPriceFilter] = useState("All Prices");
  const [eventStatus, setEventStatus] = useState("All Events");
  const [sort, setSort] = useState("date-asc");
  const [page, setPage] = useState(1);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const today = useSyncExternalStore(
    subscribeToNothing,
    getTodaySnapshot,
    getServerTodaySnapshot
  );

  // Fetch published events from Spring Boot.
  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
      setIsLoading(true);
      setApiError(null);

      try {
        const response = await getPublishedEvents({
          page: 0,
          size: 100,
        });

        if (!isActive) return;

        const apiEvents: EventItem[] = response.data.map((event) => {
          const timeValue = event.startTime || "";
          const [hoursText, minutesText] = timeValue.split(":");
          const hours = Number(hoursText);

          const time =
            Number.isFinite(hours) && minutesText
              ? `${String(hours % 12 || 12).padStart(2, "0")}:${minutesText.slice(0, 2)} ${hours >= 12 ? "PM" : "AM"}`
              : "Time not specified";

          return {
            id: event.id,
            name: event.title,
            description:
              event.shortDescription || event.description || "",
            category: event.category || "Other",

            type:
              event.eventType === "ONLINE"
                ? "Online"
                : event.eventType === "HYBRID"
                  ? "Hybrid"
                  : "Offline",

            date: event.startDate,
            time,

            city:
              event.city ||
              (event.eventType === "ONLINE"
                ? "Online"
                : "Location not specified"),

            venue:
              event.venueName ||
              (event.eventType === "ONLINE"
                ? "Virtual Conference"
                : "Venue not specified"),

            price:
              event.ticketType === "FREE"
                ? 0
                : Number(event.ticketPrice ?? 0),

            banner:
              event.bannerUrl ||
              event.thumbnailUrl ||
              "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900",

            status: "PUBLISHED",
          };
        });

        setEvents(apiEvents);
      } catch (error) {
        if (!isActive) return;

        setEvents([]);

        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to connect to the events service."
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isActive = false;
    };
  }, []);

  // Dynamically generate locations from available events.
  const locations = useMemo(
    () => [
      "All Locations",
      ...Array.from(new Set(events.map((event) => event.city))).sort(),
    ],
    [events]
  );

  // Build search suggestions from available event data.
  const searchSuggestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return [];

    const suggestions = [
      ...events.map((event) => event.name),
      ...events.map((event) => event.category),
      ...events.map((event) => event.city),
      ...events.map((event) => event.venue),
    ];

    return Array.from(new Set(suggestions))
      .filter(
        (item) =>
          item.toLowerCase().includes(keyword) &&
          item.toLowerCase() !== keyword
      )
      .slice(0, 5);
  }, [events, search]);

  // Apply filters and sorting.
  const filteredEvents = useMemo(() => {
    let result = events.filter((event) => {
      const keyword = search.toLowerCase().trim();

      const matchesSearch =
        !keyword ||
        event.name.toLowerCase().includes(keyword) ||
        event.description.toLowerCase().includes(keyword) ||
        event.category.toLowerCase().includes(keyword) ||
        event.city.toLowerCase().includes(keyword) ||
        event.venue.toLowerCase().includes(keyword);

      const matchesCategory =
        category === "All Categories" || event.category === category;

      const matchesType =
        eventType === "All Types" || event.type === eventType;

      const matchesDate = !selectedDate || event.date === selectedDate;

      const matchesLocation =
        location === "All Locations" || event.city === location;

      const matchesPrice =
        priceFilter === "All Prices" ||
        (priceFilter === "Free Events" && event.price === 0) ||
        (priceFilter === "Paid Events" && event.price > 0);

      const matchesStatus =
        eventStatus === "All Events" ||
        (eventStatus === "Upcoming Events" && event.date >= today) ||
        (eventStatus === "Past Events" && event.date < today);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesDate &&
        matchesLocation &&
        matchesPrice &&
        matchesStatus
      );
    });

    result = [...result].sort((a, b) => {
      if (sort === "date-asc") return a.date.localeCompare(b.date);
      if (sort === "date-desc") return b.date.localeCompare(a.date);
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0;
    });

    return result;
  }, [
    search,
    category,
    eventType,
    selectedDate,
    location,
    priceFilter,
    eventStatus,
    sort,
    today,
    events,
  ]);

  // Pagination.
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(totalPages, 1));

  const visibleEvents = filteredEvents.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  // Reset filters.
  function resetFilters() {
    setSearch("");
    setShowSuggestions(false);
    setCategory("All Categories");
    setEventType("All Types");
    setSelectedDate("");
    setLocation("All Locations");
    setPriceFilter("All Prices");
    setEventStatus("All Events");
    setSort("date-asc");
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            CommUnity<span className="text-indigo-600">.</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex">
            <Link href="/" className="hover:text-indigo-600">
              Home
            </Link>
            <Link href="/events" className="text-indigo-600">
              Explore Events
            </Link>
            <Link href="/my-events" className="hover:text-indigo-600">
              My Events
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-slate-700 sm:block"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      {/* Page Heading */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Discover experiences
          </p>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Explore Events
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Discover upcoming events, connect with communities and find
                experiences that match your interests.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              Discover something new today.
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* API loading status */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-indigo-900">
                  Loading published events
                </p>
                <p className="mt-1 text-xs text-indigo-700">
                  Please wait while we fetch the latest events.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API connection error */}
        {apiError && !isLoading && (
          <div
            role="alert"
            className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-sm font-bold text-red-900">
                Unable to load published events
              </p>
              <p className="mt-1 text-xs leading-5 text-red-800">
                We couldn&apos;t connect to the events service. Please try
                again.
              </p>
              <p className="mt-1 break-all text-xs text-red-700">
                Technical detail: {apiError}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="shrink-0 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-xs font-bold text-red-900 transition hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Search with Suggestions */}
            <div className="relative lg:col-span-2">
              <label
                htmlFor="event-search"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Search Events
              </label>

              <div className="relative">
                <input
                  id="event-search"
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" || e.key === "Enter") {
                      setShowSuggestions(false);
                    }
                  }}
                  placeholder="Search by event name, description, category, city or venue..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                      setShowSuggestions(false);
                    }}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    ×
                  </button>
                )}
              </div>

              {showSuggestions &&
                search.trim() &&
                searchSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Suggestions
                    </p>

                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion}-${index}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSearch(suggestion);
                          setPage(1);
                          setShowSuggestions(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <span className="text-slate-400">⌕</span>
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="event-category"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Category
              </label>
              <select
                id="event-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Type */}
            <div>
              <label
                htmlFor="event-type"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Event Type
              </label>
              <select
                id="event-type"
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
              >
                {eventTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label
                htmlFor="event-date"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Event Date
              </label>
              <input
                id="event-date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            {/* Location Filter */}
            <div>
              <label
                htmlFor="event-location"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Location
              </label>
              <select
                id="event-location"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
              >
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label
                htmlFor="event-price"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Ticket Price
              </label>
              <select
                id="event-price"
                value={priceFilter}
                onChange={(e) => {
                  setPriceFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
              >
                {priceOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Status Filter */}
            <div>
              <label
                htmlFor="event-status"
                className="mb-2 block text-xs font-bold text-slate-700"
              >
                Event Status
              </label>
              <select
                id="event-status"
                value={eventStatus}
                onChange={(e) => {
                  setEventStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-500"
              >
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Summary and Sorting */}
          <div className="mt-5 flex flex-col justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredEvents.length}
              </span>{" "}
              matching events
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="event-sort"
                className="text-xs font-semibold text-slate-600"
              >
                Sort by
              </label>

              <select
                id="event-sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-500"
              >
                <option value="date-asc">Upcoming first</option>
                <option value="date-desc">Latest date</option>
                <option value="name">Event name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>

              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Event Listing */}
        <div className="mt-9">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {eventStatus === "Past Events"
                  ? "Past Events"
                  : eventStatus === "Upcoming Events"
                    ? "Upcoming Events"
                    : "Explore Events"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Find your next experience.
              </p>
            </div>

            <span className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
              {filteredEvents.length} Events
            </span>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className="h-52 animate-pulse bg-slate-200" />
                  <div className="space-y-4 p-5">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-9 w-28 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : apiError ? (
            <div className="rounded-2xl border border-dashed border-red-200 bg-white px-6 py-16 text-center">
              <h3 className="text-xl font-bold text-slate-900">
                Events are temporarily unavailable
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                We couldn&apos;t retrieve published events from the server.
                Please check your connection and try again.
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <span className="text-2xl text-indigo-600">✦</span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No events published yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are currently no published events. Please check again
                later for new experiences and activities.
              </p>
            </div>
          ) : visibleEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleEvents.map((event) => (
                <EventCard
                  key={event.id}
                  variant="listing"
                  event={event}
                  today={today}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-indigo-600"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                  <path d="M8 11h6" />
                </svg>
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-900">
                No events found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                We couldn&apos;t find any events matching your current search or
                filters. Try adjusting your criteria to discover more events.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Clear Search
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !apiError && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => setPage(safePage - 1)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (number) => (
                <button
                  type="button"
                  key={number}
                  onClick={() => setPage(number)}
                  className={`h-9 w-9 rounded-lg text-xs font-bold ${
                    safePage === number
                      ? "bg-indigo-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-indigo-50"
                  }`}
                >
                  {number}
                </button>
              )
            )}

            <button
              type="button"
              disabled={safePage === totalPages}
              onClick={() => setPage(safePage + 1)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-8 sm:flex-row sm:items-center">
          <Link href="/" className="text-lg font-extrabold">
            CommUnity<span className="text-indigo-600">.</span>
          </Link>

          <p className="text-xs text-slate-400">
            © 2026 CommUnity. All rights reserved.
          </p>

          <p className="text-xs text-slate-500">
            Discover. Connect. Experience.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-6 py-20 text-center">
          <p className="text-sm font-medium text-slate-500">
            Loading events...
          </p>
        </main>
      }
    >
      <EventsContent />
    </Suspense>
  );
}
