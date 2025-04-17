// 导出所有仓库实例
export { userRepository } from './user.repository';
export { productRepository } from './product.repository';
export { cartRepository } from './cart.repository';
export { orderRepository } from './order.repository';

// 导出仓库类型（如果需要）
export type { UserRepository } from './user.repository';
export type { ProductRepository } from './product.repository';
export type { CartRepository, CartRepositoryInterface } from './cart.repository';
export type { OrderRepository } from './order.repository';
