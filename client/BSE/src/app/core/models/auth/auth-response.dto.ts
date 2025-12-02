export interface AuthResponseDto {
  token: string;
  email: string;
  fullName: string;
  role: 'User';
  expiresAt: string;
}
