
"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getPublishedEventById } from "@/lib/events-api";
import type { Event } from "@/types/event";

type EventDetails = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  type: "Online" | "Offline" | "Hybrid";
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  city: string;
  venue: string;
  address: string;
  locationUrl: string;
  ticketPrice: number;
  banner: string | null;
};

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "Time not specified";

  if (time.includes("AM") || time.includes("PM")) {
    return time;
  }

  const [hoursText, minutesText] = time.split(":");
  const hours = Number(hoursText);

  if (!Number.isFinite(hours) || !minutesText) {
    return time;
  }

  return `${String(hours % 12 || 12).padStart(2, "0")}:${minutesText.slice(
    0,
    2
  )} ${hours >= 12 ? "PM" : "AM"}`;
}

function mapApiEventToDetails(event: Event): EventDetails {
  const type =
    event.eventType === "ONLINE"
      ? "Online"
      : event.eventType === "HYBRID"
        ? "Hybrid"
        : "Offline";

  const venue =
    event.venueName ||
    (type === "Online" ? "Virtual Conference" : "Venue not specified");

  const address = [
    event.address,
    event.city,
    event.state,
    event.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: event.id,
    title: event.title,
    shortDescription:
      event.shortDescription ||
      event.description ||
      "No short description is available.",
    description:
      event.description ||
      event.shortDescription ||
      "No additional event description is available.",
    category: event.category || "Other",
    type,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: formatTime(event.startTime),
    endTime: formatTime(event.endTime),
    timezone: event.timezone || "Timezone not specified",
    city: event.city || (type === "Online" ? "Online" : "Location not specified"),
    venue,
    address: address || venue,
    locationUrl: event.locationUrl || event.onlineMeetingUrl || "",
    ticketPrice:
      event.ticketType === "FREE" ? 0 : Number(event.ticketPrice ?? 0),
    banner: event.bannerUrl || event.thumbnailUrl || null,
  };
}

function EventDetailsContent() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadEvent() {
      setIsLoading(true);
      setError(null);
      setEvent(null);

      try {
        const response = await getPublishedEventById(eventId);

        if (!isActive) return;

        setEvent(mapApiEventToDetails(response));
      } catch (err) {
        if (!isActive) return;

        setEvent(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve event details."
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    if (eventId) {
      loadEvent();
    }

    return () => {
      isActive = false;
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading event details...
          </p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-20">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl text-indigo-600">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Event Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error ||
              "We couldn't find this published event. It may have been removed or is no longer available."}
          </p>

          <Link
            href="/events"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const location = [event.venue, event.address]
    .filter(Boolean)
    .join(", ");

  const isFree = event.ticketPrice === 0;

  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
            CommUnity<span className="text-indigo-600">.</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-500 md:flex">
            <Link href="/" className="transition hover:text-indigo-600">
              Home
            </Link>
            <Link href="/events" className="text-indigo-600">
              Explore Events
            </Link>
            <Link
              href="/my-events"
              className="transition hover:text-indigo-600"
            >
              My Events
            </Link>
          </div>

          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Log in
          </Link>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-5 pt-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-indigo-600">
            Home
          </Link>
          <span>/</span>
          <Link href="/events" className="hover:text-indigo-600">
            Explore Events
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">
            Event Details
          </span>
        </div>
      </div>

      {/* Event Banner */}
      <section className="mx-auto mt-7 max-w-7xl px-5">
        <div className="relative h-[300px] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-800 sm:h-[400px] lg:h-[480px]">
          {event.banner && (
            <Image
              src={event.banner}
              alt={event.title}
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-indigo-700">
              {event.category}
            </span>

            <h1 className="mt-5 max-w-4xl text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/90 sm:text-base">
              {event.shortDescription}
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-white">
              <span className="rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                {event.type}
              </span>
              <span className="rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                {event.city}
              </span>
              <span className="rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                {formatDate(event.startDate)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto mt-10 grid max-w-7xl gap-8 px-5 lg:grid-cols-[1fr_350px]">
        <div className="space-y-8">
          {/* About Event */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Event Overview
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              About This Event
            </h2>

            <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-600">
              {event.description}
            </p>
          </section>

          {/* Venue */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Where It Happens
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Venue & Location
            </h2>

            <div className="mt-6 rounded-xl bg-slate-50 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-700">
                  <span aria-hidden="true">⌖</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {event.venue}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {location}
                  </p>

                  <p className="mt-3 text-xs font-semibold text-indigo-600">
                    Event Format: {event.type}
                  </p>
                </div>
              </div>

              {event.locationUrl && (
                <a
                  href={event.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex rounded-lg border border-indigo-200 bg-white px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
                >
                  {event.type === "Online"
                    ? "Join Online Event"
                    : "View Location on Map"}
                </a>
              )}
            </div>
          </section>
        </div>

        {/* Registration Sidebar */}
        <aside className="h-fit space-y-5 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registration
            </p>

            <p className="mt-2 text-3xl font-extrabold text-slate-900">
              {isFree
                ? "Free"
                : `₹${event.ticketPrice.toLocaleString("en-IN")}`}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {isFree ? "No ticket price" : "Per ticket"}
            </p>

            <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs text-slate-400">Start Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(event.startDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">End Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDate(event.endDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Event Time</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {event.startTime} - {event.endTime}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {event.timezone}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Location</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {event.city}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Event Format</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {event.type}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled
              title="Booking integration will be connected after the booking API is available."
              className="mt-7 w-full cursor-not-allowed rounded-xl bg-slate-300 px-5 py-4 text-sm font-bold text-slate-600"
            >
              {isFree ? "Register Now" : "Book Tickets"}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
              Booking functionality will be enabled after integration with
              the booking service.
            </p>
          </section>
        </aside>
      </div>

      {/* Back to Events */}
      <div className="mx-auto mt-12 max-w-7xl px-5 text-center">
        <Link
          href="/events"
          className="inline-flex rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
        >
          ← Back to Explore Events
        </Link>
      </div>

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

export default function EventDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm font-medium text-slate-500">
            Loading event details...
          </p>
        </main>
      }
    >
      <EventDetailsContent />
    </Suspense>
  );
}
