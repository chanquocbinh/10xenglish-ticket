/**
 * Điểm truy cập duy nhất tới biến môi trường + hằng số hạ tầng.
 * Mọi module KHÔNG đọc process.env trực tiếp.
 */
export const env = {
  jwtSecret:
    process.env.JWT_SECRET ||
    '10xenglish-cms-ticket-super-secret-key-2026-production-ready',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export const AUTH_COOKIE_NAME = 'cms_session_token';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SYSTEM_SETTING_ID = 'default';
export const DEFAULT_USER_PASSWORD = '10xEnglish@2026';
export const PASSWORD_SALT_ROUNDS = 10;
