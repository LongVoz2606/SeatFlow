import { apiService, IApiRequestParams } from '../index';
import { IApiResponse, IPageResponse } from '../../../types';
import { IAdminUser, IAdminUserQuery, ILoginRequest, IRegisterRequest, ITokenResponse, IUserInfoResponse } from './auth.interface';

export default {
  login(params: IApiRequestParams<null, null, ILoginRequest>): Promise<IApiResponse<ITokenResponse>> {
    return apiService({
      url: '/auth/login',
      method: 'POST',
      ...params,
    });
  },

  register(params: IApiRequestParams<null, null, IRegisterRequest>): Promise<IApiResponse<ITokenResponse>> {
    return apiService({
      url: '/auth/register',
      method: 'POST',
      ...params,
    });
  },

  getMe(): Promise<IApiResponse<IUserInfoResponse>> {
    return apiService({
      url: '/auth/me',
      method: 'GET',
    });
  },

  adminListUsers(params?: IApiRequestParams<null, IAdminUserQuery, null>): Promise<IApiResponse<IPageResponse<IAdminUser>>> {
    return apiService({
      url: '/auth/users',
      method: 'GET',
      ...params,
    });
  },

  adminSetUserStatus(params: IApiRequestParams<{ id: number }, null, { enabled: boolean }>): Promise<IApiResponse<void>> {
    return apiService({
      url: '/auth/users/:id/status',
      method: 'PATCH',
      ...params,
    });
  },
};
