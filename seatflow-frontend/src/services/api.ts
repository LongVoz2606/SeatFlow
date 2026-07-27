import axios from 'axios';
import { ApiResponse, Booking, Event } from '../types';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEvents = async (): Promise<Event[]> => {
  const res = await api.get<ApiResponse<Event[]>>('/events');
  return res.data.data;
};

export const getEventDetail = async (id: number): Promise<Event> => {
  const res = await api.get<ApiResponse<Event>>(`/events/${id}`);
  return res.data.data;
};

export interface HoldSeatsPayload {
  eventId: number;
  userId: number;
  seatIds: number[];
}

export const holdSeats = async (payload: HoldSeatsPayload, idempotencyKey: string): Promise<Booking> => {
  const res = await api.post<ApiResponse<Booking>>('/bookings/hold', payload, {
    headers: {
      'Idempotency-Key': idempotencyKey,
    },
  });
  return res.data.data;
};

export interface ConfirmBookingPayload {
  bookingCode: string;
  userId: number;
  paymentMethod?: string;
}

export const confirmBooking = async (payload: ConfirmBookingPayload): Promise<Booking> => {
  const res = await api.post<ApiResponse<Booking>>('/bookings/confirm', payload);
  return res.data.data;
};

export const getBooking = async (bookingCode: string): Promise<Booking> => {
  const res = await api.get<ApiResponse<Booking>>(`/bookings/${bookingCode}`);
  return res.data.data;
};
