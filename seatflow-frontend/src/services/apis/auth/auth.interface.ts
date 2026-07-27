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
}
