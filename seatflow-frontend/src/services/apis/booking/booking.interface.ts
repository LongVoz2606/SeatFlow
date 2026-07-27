export interface IHoldSeatsPayload {
  eventId: number;
  userId?: number;
  seatIds: number[];
}

export interface IConfirmBookingPayload {
  bookingCode: string;
  userId?: number;
  paymentMethod?: string;
}

export interface IAdminBookingQuery {
  page?: number;
  size?: number;
}

export interface IAdminBooking {
  id: number;
  bookingCode: string;
  userId: number;
  eventId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface IAdminBookingListResponse {
  page: {
    content: IAdminBooking[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  totalRevenue: number;
}
