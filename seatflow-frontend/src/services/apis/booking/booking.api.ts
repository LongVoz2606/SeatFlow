import { apiService, IApiRequestParams } from '../index';
import { IApiResponse, IBooking } from '../../../types';
import { IHoldSeatsPayload, IConfirmBookingPayload, IAdminBookingQuery, IAdminBookingListResponse } from './booking.interface';

export default {
  holdSeats(params: IApiRequestParams<null, null, IHoldSeatsPayload> & { idempotencyKey?: string }): Promise<IApiResponse<IBooking>> {
    const headers = params.idempotencyKey ? { 'Idempotency-Key': params.idempotencyKey } : undefined;
    return apiService({
      url: '/bookings/hold',
      method: 'POST',
      body: params.body,
      headers: {
        ...params.headers,
        ...headers,
      },
    });
  },

  confirmBooking(params: IApiRequestParams<null, null, IConfirmBookingPayload>): Promise<IApiResponse<IBooking>> {
    return apiService({
      url: '/bookings/confirm',
      method: 'POST',
      ...params,
    });
  },

  getBooking(params: IApiRequestParams<{ bookingCode: string }, null, null>): Promise<IApiResponse<IBooking>> {
    return apiService({
      url: '/bookings/:bookingCode',
      method: 'GET',
      ...params,
    });
  },

  getMyBookings(params?: IApiRequestParams<null, null, null>): Promise<IApiResponse<IBooking[]>> {
    return apiService({
      url: '/bookings/my',
      method: 'GET',
      ...params,
    });
  },

  adminListBookings(params?: IApiRequestParams<null, IAdminBookingQuery, null>): Promise<IApiResponse<IAdminBookingListResponse>> {
    return apiService({
      url: '/bookings/admin',
      method: 'GET',
      ...params,
    });
  },
};
