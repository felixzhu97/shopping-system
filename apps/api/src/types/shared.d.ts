// /**
//  * 共享模块类型声明文件
//  */
// declare module 'shared' {
//   export interface Product {
//     id: string;
//     name: string;
//     description: string;
//     price: number;
//     image: string;
//     category: string;
//     stock: number;
//     rating?: number;
//     reviewCount?: number;
//     originalPrice?: number;
//     inStock?: boolean;
//   }

//   export interface CartItem {
//     productId: string;
//     quantity: number;
//     product?: Product;
//   }

//   export interface Cart {
//     items: CartItem[];
//   }

//   export interface User {
//     id: string;
//     username: string;
//     email: string;
//     role: 'user' | 'admin';
//   }

//   export interface Order {
//     id: string;
//     userId: string;
//     items: CartItem[];
//     totalAmount: number;
//     status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
//     createdAt: Date;
//     updatedAt: Date;
//   }
// }
