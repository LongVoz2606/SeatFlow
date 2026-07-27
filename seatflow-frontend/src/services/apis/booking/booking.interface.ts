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
