export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: number;
  provider?: 'manual' | 'google';
  hasPassword?: boolean;
}

export interface AuthSession {
  user: AuthUser;
  deviceId: string;
  expiresAt: number;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface Device {
  id: string;
  name: string;
  os: string;
  browser: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  ip: string;
  firstLogin: number;
  lastLogin: number;
  isCurrent: boolean;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  userId?: string;
  username?: string;
  displayName?: string;
  email?: string;
  hasAvatar?: boolean;
  message?: string;
  completedAt?: number;
  resetUrl?: string;
  resetToken?: string;
  sessionToken?: string;
  otp?: string;
  provider?: 'manual' | 'google';
  hasPassword?: boolean;
}
