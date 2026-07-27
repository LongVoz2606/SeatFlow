export type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface Seat {
  id: number;
  eventId: number;
  seatNumber: string;
  seatRow: string;
  seatType: string;
  price: number;
  status: SeatStatus;
  heldUntil?: string;
  heldByUserId?: number;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  bannerUrl: string;
  totalSeats: number;
  availableSeats: number;
  status: string;
  seats?: Seat[];
}

export interface Booking {
  id: number;
  bookingCode: string;
  userId: number;
  eventId: number;
  eventTitle: string;
  status: BookingStatus;
  totalAmount: number;
  expiresAt: string;
  createdAt: string;
  reservedSeats: Seat[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
