"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import BackendStatus from "@/components/BackendStatus";
import { getPublishedEvents } from "@/lib/events-api";
import type { Event } from "@/types/event";

const categories = [
  { name: "Technology", icon: "⌘", count: "Innovation & tech" },
  { name: "Business", icon: "▤", count: "Ideas & networking" },
  { name: "Music", icon: "♫", count: "Live performances" },
  { name: "Education", icon: "▱", count: "Learning & workshops" },
  { name: "Arts", icon: "✳", count: "Art & creativity" },
  { name: "Sports", icon: "◉", count: "Sports & fitness" },
];

type HomepageFeaturedEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  day: string;
  month: string;
  year: string;
  location: string;
  type: string;
  price: string;
  image: string;
};

type HomepageUpcomingEvent = {
  id?: string;
  title: string;
  category: string;
  date: string;
  location: string;
  price: string;
  image: string;
};

function formatHomepageDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapEventToFeatured(event: Event): HomepageFeaturedEvent {
  const [year, month, day] = event.startDate.split("-");

  const monthName = new Date(
    Number(year),
    Number(month) - 1,
    1
  )
    .toLocaleDateString("en-IN", { month: "short" })
    .toUpperCase();

  return {
    id: event.id,
    title: event.title,
    description:
      event.shortDescription ||
      event.description ||
      "Discover this exciting event on CommUnity.",
    category: event.category || "General",
    day,
    month: monthName,
    year,
    location:
      event.eventType === "ONLINE"
        ? "Online"
        : [event.city, event.state].filter(Boolean).join(", ") ||
          "Location to be announced",
    type:
      event.eventType === "ONLINE"
        ? "Online"
        : event.eventType === "HYBRID"
          ? "Hybrid"
          : "Offline",
    price:
      event.ticketType === "FREE" || event.ticketPrice === 0
        ? "Free"
        : `₹${event.ticketPrice}`,
    image:
      event.bannerUrl ||
      event.thumbnailUrl ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000",
  };
}

function mapEventToUpcoming(event: Event): HomepageUpcomingEvent {
  return {
    id: event.id,
    title: event.title,
    category: event.category || "General",
    date: formatHomepageDate(event.startDate),
    location:
      event.eventType === "ONLINE"
        ? "Online"
        : [event.city, event.state].filter(Boolean).join(", ") ||
          "Location to be announced",
    price:
      event.ticketType === "FREE" || event.ticketPrice === 0
        ? "Free"
        : `₹${event.ticketPrice}`,
    image:
      event.bannerUrl ||
      event.thumbnailUrl ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700",
  };
}

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<
    HomepageFeaturedEvent[]
  >([]);

  const [upcomingEvents, setUpcomingEvents] = useState<
    HomepageUpcomingEvent[]
  >([]);

  const [eventsLoading, setEventsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadHomepageEvents() {
      try {
        const response = await getPublishedEvents({
          page: 0,
          size: 10,
        });

        if (!isActive) return;

        const events = response.data || [];
        setApiError(null);

        setFeaturedEvents(
          events.slice(0, 3).map(mapEventToFeatured)
        );

        const sortedUpcomingEvents = [...events].sort((a, b) =>
          a.startDate.localeCompare(b.startDate)
        );

        setUpcomingEvents(
          sortedUpcomingEvents
            .slice(0, 3)
            .map(mapEventToUpcoming)
        );
      } catch (error) {
        console.error("Unable to load homepage events:", error);

        if (!isActive) return;

        setFeaturedEvents([]);
        setUpcomingEvents([]);
        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to connect to the events service."
        );
      } finally {
        if (isActive) {
          setEventsLoading(false);
        }
      }
    }

    loadHomepageEvents();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            CommUnity<span className="text-indigo-600">.</span>
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-indigo-600"
            >
              Home
            </Link>

            <Link
              href="/events"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              Explore Events
            </Link>

            <Link
              href="/#categories"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              Categories
            </Link>

            <Link
              href="/my-events"
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              My Events
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-indigo-600 sm:block"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 md:py-28 lg:grid-cols-2 lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              YOUR NEXT EXPERIENCE STARTS HERE
            </div>

            <h1 className="mt-7 max-w-xl text-5xl font-extrabold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              Discover.
              <span className="block text-indigo-600">Connect.</span>
              Experience.
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-slate-500">
              Find events that inspire you, connect with people who share your
              interests, and make every moment memorable.
            </p>

            {/* Search */}
            <form
              action="/events"
              method="GET"
              className="mt-9 flex max-w-xl flex-col gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60 sm:flex-row"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5 shrink-0 text-slate-400"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>

                <input
                  type="search"
                  name="search"
                  placeholder="Search events, categories or locations..."
                  aria-label="Search events"
                  className="min-w-0 flex-1 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Search Events
                <span className="ml-2">→</span>
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Explore:</span>

              <Link
                href="/events?category=Technology"
                className="transition hover:text-indigo-600"
              >
                Technology
              </Link>

              <span>·</span>

              <Link
                href="/events?category=Music"
                className="transition hover:text-indigo-600"
              >
                Music
              </Link>

              <span>·</span>

              <Link
                href="/events?category=Business"
                className="transition hover:text-indigo-600"
              >
                Business
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative overflow-hidden rounded-3xl bg-slate-200 shadow-2xl shadow-indigo-100">
              <Image
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"
                alt="People attending a live event"
                width={1200}
                height={900}
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[390px] w-full object-cover sm:h-[480px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-9">
                <span className="rounded-md bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                  Discover experiences
                </span>

                <h2 className="mt-4 max-w-sm text-3xl font-bold leading-tight">
                  Moments become memories when shared.
                </h2>

                <Link
                  href="/events"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-indigo-200"
                >
                  Explore events <span>→</span>
                </Link>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-3 rounded-xl border border-slate-100 bg-white p-4 shadow-xl sm:-left-8 sm:p-5">
              <p className="text-xs font-medium text-slate-400">
                Find your community
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Discover what interests you.
              </p>
            </div>

            <div className="absolute -right-2 top-8 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl sm:-right-5">
              <p className="text-xs font-semibold text-indigo-600">Explore</p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                New experiences
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Browse by interest
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Explore categories
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Discover experiences based on what you love.
            </p>
          </div>

          <Link
            href="/events"
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            View all events →
          </Link>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/events?category=${encodeURIComponent(category.name)}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl font-bold text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                {category.icon}
              </div>

              <h3 className="mt-5 text-sm font-bold text-slate-900">
                {category.name}
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                {category.count}
              </p>

              <div className="mt-4 text-sm font-semibold text-indigo-600 opacity-0 transition group-hover:opacity-100">
                Explore →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Events */}
      <section className="border-y border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Selected experiences
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Featured events
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                Events worth adding to your calendar.
              </p>
            </div>

            <Link
              href="/events"
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
            >
              Explore all events →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventsLoading ? (
              <p className="col-span-full py-8 text-center text-sm text-slate-500">
                Loading featured events...
              </p>
            ) : apiError ? (
              <div className="col-span-full py-8 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Featured events are temporarily unavailable.
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Please check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  Retry
                </button>
              </div>
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  variant="featured"
                  event={event}
                />
              ))
            ) : (
              <p className="col-span-full py-8 text-center text-sm text-slate-500">
                No published events available yet. Check back soon!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Save the date
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Coming up next
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Take a look at what&apos;s happening soon.
            </p>
          </div>

          <Link
            href="/events"
            className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
          >
            View event calendar →
          </Link>
        </div>

        <div className="mt-9 divide-y divide-slate-100 border-y border-slate-200">
          {eventsLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Loading upcoming events...
            </p>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventCard
                key={event.id ?? event.title}
                variant="upcoming"
                event={event}
              />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              No upcoming events available yet.
            </p>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="mx-5 mb-20 overflow-hidden rounded-2xl bg-indigo-700 sm:mx-8 lg:mx-auto lg:max-w-7xl">
        <div className="relative px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-20 -top-32 h-72 w-72 rounded-full border-[40px] border-white/5" />

          <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full border-[50px] border-white/5" />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
              Your next experience awaits
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Find something worth experiencing.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-indigo-100">
              Explore events, discover new interests and connect with people
              who make every experience meaningful.
            </p>

            <Link
              href="/events"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
            >
              Explore Events <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Backend Status */}
      <div className="mx-auto max-w-7xl px-5 pb-8 sm:px-8 lg:px-10">
        <BackendStatus />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link
                href="/"
                className="text-2xl font-extrabold tracking-tight"
              >
                CommUnity<span className="text-indigo-600">.</span>
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
                Discover experiences, connect with communities and make every
                event a memorable moment.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Discover</h3>

              <div className="mt-4 space-y-3">
                <Link
                  href="/events"
                  className="block text-sm text-slate-500 transition hover:text-indigo-600"
                >
                  Explore Events
                </Link>

                <Link
                  href="/events?category=Technology"
                  className="block text-sm text-slate-500 transition hover:text-indigo-600"
                >
                  Categories
                </Link>

                <Link
                  href="/events"
                  className="block text-sm text-slate-500 transition hover:text-indigo-600"
                >
                  Upcoming Events
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Account</h3>

              <div className="mt-4 space-y-3">
                <Link
                  href="/login"
                  className="block text-sm text-slate-500 transition hover:text-indigo-600"
                >
                  Log in
                </Link>

                <Link
                  href="/register"
                  className="block text-sm text-slate-500 transition hover:text-indigo-600"
                >
                  Sign up
                </Link>

                <Link
                  href="/my-events"
                  className="block text-sm text-slate-500 transition hover:text-indigo-600"
                >
                  My Events
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-400">
              © 2026 CommUnity. All rights reserved.
            </p>

            <p className="text-xs font-medium text-slate-500">
              Discover. Connect. Experience.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}