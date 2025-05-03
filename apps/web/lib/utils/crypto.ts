import CryptoJS from 'crypto-js';

// 加密密钥，实际项目中应该从环境变量中获取
const SECRET_KEY = process.env.SECRET_KEY || '8d4e3e3f-aa23-4f52-8d1f-609c68cdf7a6';

// 加密函数
export function encrypt(data: string): string {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

// 解密函数
export function decrypt(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// 适配 zustand persist 的 storage
export const encryptedStorage = {
  getItem: (name: string): string | null => {
    if (typeof localStorage === 'undefined') return null;
    const data = localStorage.getItem(name);
    if (!data) return null;
    try {
      return decrypt(data);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof localStorage === 'undefined') return;
    const encrypted = encrypt(value);
    localStorage.setItem(name, encrypted);
  },
  removeItem: (name: string) => {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(name);
  },
};
