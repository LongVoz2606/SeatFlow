import { apiService, IApiRequestParams } from '../index';
import { IApiResponse, IOrganizer, IOrganizerPublic } from '../../../types';
import { IRegisterOrganizerBody, IRejectOrganizerBody } from './organizer.interface';

export default {
  register(params: IApiRequestParams<null, null, IRegisterOrganizerBody>): Promise<IApiResponse<number>> {
    return apiService({
      url: '/organizers/register',
      method: 'POST',
      ...params,
    });
  },

  resubmit(params: IApiRequestParams<null, null, IRegisterOrganizerBody>): Promise<IApiResponse<void>> {
    return apiService({
      url: '/organizers/resubmit',
      method: 'POST',
      ...params,
    });
  },

  getMe(): Promise<IApiResponse<IOrganizer | null>> {
    return apiService({
      url: '/organizers/me',
      method: 'GET',
    });
  },

  getPublicById(params: IApiRequestParams<{ id: number }, null, null>): Promise<IApiResponse<IOrganizerPublic>> {
    return apiService({
      url: '/organizers/:id',
      method: 'GET',
      ...params,
    });
  },

  list(): Promise<IApiResponse<IOrganizerPublic[]>> {
    return apiService({
      url: '/organizers',
      method: 'GET',
    });
  },

  listPending(): Promise<IApiResponse<IOrganizer[]>> {
    return apiService({
      url: '/organizers/pending',
      method: 'GET',
    });
  },

  approve(params: IApiRequestParams<{ id: number }, null, null>): Promise<IApiResponse<void>> {
    return apiService({
      url: '/organizers/:id/approve',
      method: 'PATCH',
      ...params,
    });
  },

  reject(params: IApiRequestParams<{ id: number }, null, IRejectOrganizerBody>): Promise<IApiResponse<void>> {
    return apiService({
      url: '/organizers/:id/reject',
      method: 'PATCH',
      ...params,
    });
  },
};
