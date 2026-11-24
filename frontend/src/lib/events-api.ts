
import type {
  Event,
  EventType,
  PublishedEventsResponse,
} from "@/types/event";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface EventQueryParams {
  page?: number;
  size?: number;
  category?: string;
  city?: string;
  eventType?: EventType;
}

export async function getPublishedEvents(
  params: EventQueryParams = {}
): Promise<PublishedEventsResponse> {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }

  if (params.size !== undefined) {
    query.set("size", String(params.size));
  }

  if (params.category) {
    query.set("category", params.category);
  }

  if (params.city) {
    query.set("city", params.city);
  }

  if (params.eventType) {
    query.set("eventType", params.eventType);
  }

  const queryString = query.toString();

  const endpoint = `${API_BASE_URL}/api/events/published${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch published events. HTTP ${response.status}`
    );
  }

  const result: PublishedEventsResponse = await response.json();

  if (!result.success) {
    throw new Error(
      result.message || "Unable to retrieve published events."
    );
  }

  return result;
}

export async function getPublishedEventById(
  id: string
): Promise<Event> {
  const response = await fetch(
    `${API_BASE_URL}/api/events/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch event. HTTP ${response.status}`
    );
  }

  const result = await response.json();

  if (result.success === false) {
    throw new Error(
      result.message || "Unable to retrieve the event."
    );
  }

  return (result.data ?? result) as Event;
}
