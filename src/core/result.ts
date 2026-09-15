/**
 * Kiểu trả về thống nhất cho mọi server action.
 * Client chỉ cần kiểm tra `result.success`.
 */
export type ActionResult<T = undefined> =
  | ({ success: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { success: false; error: string; code?: string };

export function ok(): ActionResult;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T) {
  return { success: true, data } as ActionResult<T>;
}

export function fail(error: string, code?: string): ActionResult<never> {
  return { success: false, error, code };
}
