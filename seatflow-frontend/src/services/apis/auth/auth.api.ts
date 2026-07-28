import { apiService, IApiRequestParams } from '../index';
import { IApiResponse, IPageResponse } from '../../../types';
import {
  IAdminUser, IAdminUserQuery, IChangePasswordOtpRequest, IChangePasswordVerifyRequest,
  IForgotPasswordOtpRequest, IForgotPasswordVerifyRequest, ILoginRequest, IOtpSentResponse,
  IRegisterRequest, IResetPasswordRequest, IResetTokenResponse, ITokenResponse, IUserInfoResponse,
} from './auth.interface';

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

  loginWithGoogle(params: IApiRequestParams<null, null, { idToken: string }>): Promise<IApiResponse<ITokenResponse>> {
    return apiService({
      url: '/auth/oauth/google',
      method: 'POST',
      ...params,
    });
  },

  loginWithFacebook(params: IApiRequestParams<null, null, { accessToken: string }>): Promise<IApiResponse<ITokenResponse>> {
    return apiService({
      url: '/auth/oauth/facebook',
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

  forgotPasswordRequestOtp(params: IApiRequestParams<null, null, IForgotPasswordOtpRequest>): Promise<IApiResponse<IOtpSentResponse>> {
    return apiService({
      url: '/auth/forgot-password/request-otp',
      method: 'POST',
      ...params,
    });
  },

  forgotPasswordVerifyOtp(params: IApiRequestParams<null, null, IForgotPasswordVerifyRequest>): Promise<IApiResponse<IResetTokenResponse>> {
    return apiService({
      url: '/auth/forgot-password/verify-otp',
      method: 'POST',
      ...params,
    });
  },

  resetPassword(params: IApiRequestParams<null, null, IResetPasswordRequest>): Promise<IApiResponse<void>> {
    return apiService({
      url: '/auth/forgot-password/reset-password',
      method: 'POST',
      ...params,
    });
  },

  changePasswordRequestOtp(params: IApiRequestParams<null, null, IChangePasswordOtpRequest>): Promise<IApiResponse<IOtpSentResponse>> {
    return apiService({
      url: '/auth/change-password/request-otp',
      method: 'POST',
      ...params,
    });
  },

  changePasswordVerifyOtp(params: IApiRequestParams<null, null, IChangePasswordVerifyRequest>): Promise<IApiResponse<void>> {
    return apiService({
      url: '/auth/change-password/verify-otp',
      method: 'POST',
      ...params,
    });
  },
};
