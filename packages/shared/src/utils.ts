import { Cart, CartItem, Product } from "./types";

// 计算购物车总价
export function calculateCartTotal(cart: Cart, products: Product[]): number {
  return cart.items.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

// 格式化价格
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(price);
}
