/**
 * Lỗi nghiệp vụ dùng chung cho tầng service.
 * Service ném lỗi, tầng action/route bắt và chuyển thành ActionResult/HTTP.
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
    readonly code: string = 'APP_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Chưa đăng nhập') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Bạn không có quyền thực hiện thao tác này') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy dữ liệu') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Dữ liệu không hợp lệ') {
    super(message, 422, 'VALIDATION_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Dữ liệu đã tồn tại') {
    super(message, 409, 'CONFLICT');
  }
}
