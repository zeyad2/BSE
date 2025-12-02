export interface ErrorResponseDto {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]> | null;
}
