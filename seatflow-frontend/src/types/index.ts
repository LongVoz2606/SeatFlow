export type ESeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';
export type EBookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface ISeat {
  id: number;
  eventId: number;
  seatNumber: string;
  seatRow: string;
  seatType: string;
  price: number;
  status: ESeatStatus;
  heldUntil?: string;
  heldByUserId?: number;
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
  seats?: ISeat[];
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
