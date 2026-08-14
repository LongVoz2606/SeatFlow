export interface ILoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface ITokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  role: string;
}

export interface IUserInfoResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  provider: string;
}

export interface IAdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  provider: string;
}

export interface IAdminUserQuery {
  search?: string;
  page?: number;
  size?: number;
}

export type IOtpChannel = 'EMAIL' | 'SMS';

export interface IForgotPasswordOtpRequest {
  usernameOrEmail: string;
  channel: IOtpChannel;
}

export interface IForgotPasswordVerifyRequest {
  usernameOrEmail: string;
  otp: string;
}

export interface IResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}

export interface IChangePasswordOtpRequest {
  oldPassword: string;
  newPassword: string;
}

export interface IChangePasswordVerifyRequest {
  otp: string;
}

export interface IOtpSentResponse {
  maskedDestination: string;
}

export interface IResetTokenResponse {
  resetToken: string;
}
