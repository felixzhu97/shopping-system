import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController";

const router = express.Router();

// 获取用户购物车
router.get("/:userId", getCart);

// 添加商品到购物车
router.post("/:userId", addToCart);

// 更新购物车中的商品数量
router.put("/:userId/item/:productId", updateCartItem);

// 从购物车移除商品
router.delete("/:userId/item/:productId", removeFromCart);

// 清空购物车
router.delete("/:userId", clearCart);

export default router;
