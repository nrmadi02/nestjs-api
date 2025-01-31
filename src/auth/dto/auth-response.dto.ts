export class AuthResponseDto {
  user: {
    id: number;
    uuid: string;
    username: string;
    email: string;
    isVerified: boolean;
    isActive: boolean;
    lastLoginAt: Date | null;
    profile?: {
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
      phoneNumber: string | null;
    } | null;
    role?: {
      id: number;
      name: string | null;
      description?: string | null;
    } | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
