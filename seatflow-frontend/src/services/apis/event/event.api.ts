import { apiService, IApiRequestParams } from '../index';
import { IApiResponse, IEvent } from '../../../types';

export default {
  getEvents(): Promise<IApiResponse<IEvent[]>> {
    return apiService({
      url: '/events',
      method: 'GET',
    });
  },

  getEventDetail(params: IApiRequestParams<{ id: number }, null, null>): Promise<IApiResponse<IEvent>> {
    return apiService({
      url: '/events/:id',
      method: 'GET',
      ...params,
    });
  },
};
