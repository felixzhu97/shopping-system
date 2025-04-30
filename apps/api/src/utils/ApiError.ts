export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = 'ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
