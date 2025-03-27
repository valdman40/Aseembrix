import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'default-32-character-key-should-change';

/**
 * Encrypts data using AES encryption.
 * @param text - The plain text to encrypt.
 * @returns The encrypted string.
 */
export const encryptData = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

/**
 * Decrypts AES encrypted data.
 * @param cipherText - The encrypted string.
 * @returns The decrypted plain text.
 */
export const decryptData = (cipherText: string): string => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
