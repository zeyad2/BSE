export interface User {
  email: string;
  fullName: string;
  role: 'User' | 'Admin'; // Type-safe enum (not just string)
  token: string;
  expiresAt: Date;
}
