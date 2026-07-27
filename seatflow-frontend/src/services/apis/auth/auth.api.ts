import { apiService, IApiRequestParams } from '../index';
import { IApiResponse } from '../../../types';
import { ILoginRequest, IRegisterRequest, ITokenResponse, IUserInfoResponse } from './auth.interface';

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
};
