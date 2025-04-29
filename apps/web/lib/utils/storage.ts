// import { decrypt, encrypt } from './crypto';

// // 本地存储工具函数

// // 存储结算信息
// export function saveCheckoutInfo(data: any) {
//   try {
//     const encryptedData = encrypt(JSON.stringify(data));
//     localStorage.setItem('checkoutInfo', encryptedData);
//   } catch (error) {
//     console.error('保存结算信息失败:', error);
//   }
// }

// // 获取结算信息
// export function getCheckoutInfo() {
//   try {
//     const encryptedData = localStorage.getItem('checkoutInfo');
//     if (!encryptedData) return null;
//     return JSON.parse(decrypt(encryptedData));
//   } catch (error) {
//     console.error('获取结算信息失败:', error);
//     return null;
//   }
// }

// // 清除结算信息
// export function clearCheckoutInfo() {
//   try {
//     localStorage.removeItem('checkoutInfo');
//   } catch (error) {
//     console.error('清除结算信息失败:', error);
//   }
// }
