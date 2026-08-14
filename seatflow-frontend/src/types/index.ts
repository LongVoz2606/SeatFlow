export type ESeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';
export type EBookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
export type EOrganizerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ISeat {
  id: number;
  eventId: number;
  zoneId?: number | null;
  rowIndex?: number | null;
  colIndex?: number | null;
  seatNumber: string;
  seatRow: string;
  seatType: string;
  price: number;
  status: ESeatStatus;
  heldUntil?: string;
  heldByUserId?: number;
}

export interface IZone {
  id: number;
  name: string;
  seatType: string;
  price: number;
  rowCount: number;
  colCount: number;
  rowSpacing: number;
  colSpacing: number;
  curveAngle: number;
  positionX: number;
  positionY: number;
  rotation: number;
  color?: string | null;
}

export interface ISession {
  id: number;
  sessionDate: string;
  totalSeats: number;
  availableSeats: number;
  status: string;
}

export interface IEvent {
  id: number;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  bannerUrl: string;
  totalSeats: number;
  availableSeats: number;
  status: string;
  organizerId?: number;
  organizerName?: string;
  organizerDescription?: string | null;
  organizerLogoUrl?: string | null;
  isHot: boolean;
  minPrice: number;
  maxPrice: number;
  category: string;
  createdAt?: string;
  rejectionReason?: string | null;
  sessionCount?: number;
  parentEventId?: number | null;
  zones?: IZone[];
  sessions?: ISession[];
  seats?: ISeat[];
}

export interface IOrganizer {
  id: number;
  authUserId: number;
  organizationName: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  logoUrl?: string;
  status: EOrganizerStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface IOrganizerPublic {
  id: number;
  organizationName: string;
  description?: string;
  logoUrl?: string;
  contactEmail: string;
}

export interface IPageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface IBooking {
  id: number;
  bookingCode: string;
  userId: number;
  eventId: number;
  eventTitle: string;
  status: EBookingStatus;
  totalAmount: number;
  expiresAt: string;
  createdAt: string;
  seats: ISeat[];
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
