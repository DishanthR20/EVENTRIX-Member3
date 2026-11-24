
export type EventStatus =
  | "draft"
  | "published"
  | "unpublished"
  | "cancelled";

export type EventType = "ONLINE" | "OFFLINE" | "HYBRID";

export type TicketType = "FREE" | "PAID";

export interface Event {
  id: string;

  status: EventStatus;

  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;

  title: string;
  shortDescription: string | null;
  description: string | null;

  category: string | null;
  subcategory: string | null;
  tags: string[];

  eventType: EventType;

  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string | null;

  registrationStart: string | null;
  registrationEnd: string | null;

  venueName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  locationUrl: string | null;
  onlineMeetingUrl: string | null;
  capacity: number | null;

  bannerUrl: string | null;
  thumbnailUrl: string | null;
  logoUrl: string | null;

  registrationRequired: boolean;
  ticketType: TicketType;
  ticketPrice: number;
  maxAttendees: number | null;
  registrationLimit: number | null;
  waitlistEnabled: boolean;
}

export interface EventPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PublishedEventsResponse {
  success: boolean;
  message: string;
  data: Event[];
  pagination: EventPagination;
}
