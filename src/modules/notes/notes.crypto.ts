/**
 * Client-side encryption helper cho Personal Note.
 * Chạy trong browser (Web Crypto API). KHÔNG dùng ở server.
 *
 * Khóa AES-GCM 256 được dẫn xuất trực tiếp từ `userId` bằng PBKDF2 với muối
 * tĩnh app-wide. Đúng user đăng nhập => tự dẫn xuất được khóa => đọc note của
 * chính mình. Khóa `extractable: false`, chỉ tồn tại trong RAM browser.
 */

/** Muối tĩnh app-wide cho PBKDF2 (không phải secret, chỉ là salt). */
export const NOTE_KDF_SALT = '10x-note-kdf-v1';

/** Uint8Array -> base64 (không dùng Buffer để chạy được trên browser). */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** base64 -> Uint8Array. */
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Dẫn xuất AES-GCM 256 CryptoKey từ userId.
 * PBKDF2(SHA-256, 100_000 iterations), secret = userId, salt = NOTE_KDF_SALT.
 */
export async function deriveNoteKey(userId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(userId),
    { name: 'PBKDF2' },
    false,
    ['deriveKey'],
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(NOTE_KDF_SALT),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Mã hóa object/string -> { encryptedContent, iv } (base64). */
export async function encryptData(
  data: object | string,
  key: CryptoKey,
): Promise<{ encryptedContent: string; iv: string }> {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  );

  return {
    encryptedContent: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv),
  };
}

/** Giải mã -> JSON.parse; nếu parse fail trả về chuỗi thô. */
export async function decryptData<T>(
  encryptedContent: string,
  iv: string,
  key: CryptoKey,
): Promise<T> {
  const ciphertext = base64ToBytes(encryptedContent);
  const ivBytes = base64ToBytes(iv);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes as BufferSource },
    key,
    ciphertext as BufferSource,
  );

  const text = new TextDecoder().decode(decrypted);
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
