export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface RegisterRequest {
  email: string;
  role: 'client' | 'trainer';
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: 'client' | 'trainer';
}

export interface RequestReset {
  email: string;
}

export interface VerifyReset {
  email: string;
  otp: string;
}

export interface CompleteReset {
  email: string;
  newPassword: string;
}