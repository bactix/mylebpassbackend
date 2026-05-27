export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export class ResponseHelper {
  static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  static error(error: string, message: string = 'Error'): ApiResponse<null> {
    return {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
