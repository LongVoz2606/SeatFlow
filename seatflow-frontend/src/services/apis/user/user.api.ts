import { apiService, IApiRequestParams } from '../index';
import { IUserProfileResponse, IUpdateProfileRequest } from './user.interface';

export default {
  getMyProfile(params?: IApiRequestParams<null, null, null>): Promise<IUserProfileResponse> {
    return apiService({
      url: '/users/me',
      method: 'GET',
      ...params,
    });
  },

  updateProfile(params: IApiRequestParams<null, null, IUpdateProfileRequest>): Promise<IUserProfileResponse> {
    return apiService({
      url: '/users/me',
      method: 'PUT',
      body: params.body,
      ...params,
    });
  },
};
