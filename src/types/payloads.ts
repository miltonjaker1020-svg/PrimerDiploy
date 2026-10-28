export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

