import { apiService, IApiRequestParams } from '../index';
import { IApiResponse, IEvent } from '../../../types';
import { ICreateEventBody, IEventQuery } from './event.interface';

export default {
  getEvents(params?: IApiRequestParams<null, IEventQuery, null>): Promise<IApiResponse<IEvent[]>> {
    return apiService({
      url: '/events',
      method: 'GET',
      ...params,
    });
  },

  getEventDetail(params: IApiRequestParams<{ id: number }, null, null>): Promise<IApiResponse<IEvent>> {
    return apiService({
      url: '/events/:id',
      method: 'GET',
      ...params,
    });
  },

  getMyEvents(): Promise<IApiResponse<IEvent[]>> {
    return apiService({
      url: '/events/mine',
      method: 'GET',
    });
  },

  createEvent(params: IApiRequestParams<null, null, ICreateEventBody>): Promise<IApiResponse<number>> {
    return apiService({
      url: '/events',
      method: 'POST',
      ...params,
    });
  },

  setHot(params: IApiRequestParams<{ id: number }, null, { isHot: boolean }>): Promise<IApiResponse<void>> {
    return apiService({
      url: '/events/:id/hot',
      method: 'PATCH',
      ...params,
    });
  },
};
