import { IApiResponse } from '../../../types';

export interface IUserProfile {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface IUpdateProfileRequest {
  fullName: string;
  phone: string;
  avatarUrl: string;
}

export type IUserProfileResponse = IApiResponse<IUserProfile>;
