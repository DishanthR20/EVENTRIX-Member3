
import Image from "next/image";
import Link from "next/link";

type FeaturedEvent = {
  id: string | number;
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

type UpcomingEvent = {
  id?: string | number;
  title: string;
  category: string;
  date: string;
  location: string;
  price: string;
  image: string;
};

type ListingEvent = {
  id: string | number;
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
  status: string;
};

type EventCardProps =
  | {
      variant: "featured";
      event: FeaturedEvent;
    }
  | {
      variant: "upcoming";
      event: UpcomingEvent;
    }
  | {
      variant: "listing";
      event: ListingEvent;
      today: string;
    };

function formatEventDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getEventHref(id: string | number | undefined, title: string) {
  if (typeof id === "string") {
    return `/events/${encodeURIComponent(id)}`;
  }

  return `/events?search=${encodeURIComponent(title)}`;
}

export default function EventCard(props: EventCardProps) {
  // 1. Homepage featured event card
  if (props.variant === "featured") {
    const event = props.event;
    const href = getEventHref(event.id, event.title);

    return (
      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-52 overflow-hidden bg-slate-100">
          <Image
            src={event.image}
            alt={event.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <span className="absolute left-4 top-4 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
            {event.category}
          </span>

          <span className="absolute right-4 top-4 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
            {event.day} {event.month}
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
            <span>
              {event.day} {event.month} {event.year}
            </span>
            <span>{event.type}</span>
          </div>

          <h3 className="mt-3 text-lg font-bold text-slate-900 transition group-hover:text-indigo-600">
            {event.title}
          </h3>

          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-slate-500">
            {event.description}
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Registration
              </p>
              <p className="mt-1 font-bold text-slate-900">{event.price}</p>
            </div>

            <Link
              href={href}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
            >
              View Event →
            </Link>
          </div>

          <p className="mt-3 text-xs text-slate-500">{event.location}</p>
        </div>
      </article>
    );
  }

  // 2. Homepage upcoming event row
  if (props.variant === "upcoming") {
    const event = props.event;
    const href = getEventHref(event.id, event.title);

    return (
      <article className="group flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md sm:flex-row sm:items-center">
        <Image
          src={event.image}
          alt={event.title}
          width={320}
          height={160}
          unoptimized
          sizes="(max-width: 640px) 100vw, 128px"
          className="h-36 w-full rounded-lg object-cover sm:h-24 sm:w-32"
        />

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-indigo-600">
            {event.category}
          </p>

          <h3 className="mt-1 font-bold text-slate-900 transition group-hover:text-indigo-600">
            {event.title}
          </h3>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>{event.date}</span>
            <span>{event.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <p className="text-sm font-bold text-slate-900">{event.price}</p>

          <Link
            href={href}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            View Event →
          </Link>
        </div>
      </article>
    );
  }

  // 3. Explore Events listing card
  const event = props.event;
  const upcoming = event.date >= props.today;

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      {/* Event banner */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <Image
          src={event.banner}
          alt={event.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <span className="absolute left-4 top-4 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
          {event.category}
        </span>

        <span
          className={`absolute right-4 top-4 rounded-md px-3 py-1.5 text-xs font-bold ${
            upcoming
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {upcoming ? "Upcoming" : "Past"}
        </span>
      </div>

      {/* Event details */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
          <span>{formatEventDate(event.date)}</span>
          <span>{event.type}</span>
        </div>

        <h3 className="mt-3 line-clamp-2 min-h-12 text-lg font-bold text-slate-900 transition group-hover:text-indigo-600">
          {event.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
          {event.description}
        </p>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-600">
            <span className="font-semibold">Location:</span> {event.city}
          </p>

          <p className="text-xs text-slate-600">
            <span className="font-semibold">Venue:</span> {event.venue}
          </p>

          <p className="text-xs text-slate-600">
            <span className="font-semibold">Time:</span> {event.time}
          </p>
        </div>

        {/* Registration price and event details route */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Registration
            </p>

            <p className="mt-1 text-base font-bold text-slate-900">
              {event.price === 0 ? "Free" : `₹${event.price}`}
            </p>
          </div>

          <Link
            href={`/events/${event.id}`}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
          >
            View Details →
          </Link>
        </div>
      </div>
    </article>
  );
}
