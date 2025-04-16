import { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import mongoose from "mongoose";

// 获取用户购物车
export const getCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    let cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "name price image description",
    });

    if (!cart) {
      // 如果用户没有购物车，创建一个空购物车
      cart = new Cart({
        userId,
        items: [],
      });
      await cart.save();
    }

    // 转换为前端期望的格式
    const cartItems = cart.items.map((item) => {
      const productData = item.productId as any;
      return {
        productId: productData._id,
        quantity: item.quantity,
        product: {
          id: productData._id,
          name: productData.name,
          price: productData.price,
          image: productData.image,
          description: productData.description,
        },
      };
    });

    res.status(200).json({
      id: cart._id,
      userId,
      items: cartItems,
    });
  } catch (error) {
    console.error("获取购物车失败:", error);
    res.status(500).json({ message: "获取购物车失败" });
  }
};

// 添加商品到购物车
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    // 验证产品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "产品不存在" });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ message: "库存不足" });
    }

    // 查找或创建购物车
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId: new mongoose.Types.ObjectId(),
        items: [],
      });
    }

    // 检查产品是否已在购物车中
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // 更新现有产品数量
      cart.items[itemIndex].quantity += quantity;
    } else {
      // 添加新产品到购物车
      cart.items.push({
        productId: new mongoose.Types.ObjectId(),
        quantity,
      });
    }

    await cart.save();

    // 返回更新后的购物车
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.productId",
      select: "name price image description",
    });

    res.status(200).json(updatedCart);
  } catch (error) {
    console.error("添加商品到购物车失败:", error);
    res.status(500).json({ message: "添加商品到购物车失败" });
  }
};

// 更新购物车中的商品数量
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ message: "数量必须大于0" });
    }

    // 验证产品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "产品不存在" });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({ message: "库存不足" });
    }

    // 更新购物车
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "购物车不存在" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "购物车中没有此商品" });
    }

    cart.items[itemIndex].quantity = quantity;

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("更新购物车商品失败:", error);
    res.status(500).json({ message: "更新购物车商品失败" });
  }
};

// 从购物车移除商品
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.params;

    // 更新购物车
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "购物车不存在" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "购物车中没有此商品" });
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error("从购物车移除商品失败:", error);
    res.status(500).json({ message: "从购物车移除商品失败" });
  }
};

// 清空购物车
export const clearCart = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "购物车不存在" });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({ message: "购物车已清空" });
  } catch (error) {
    console.error("清空购物车失败:", error);
    res.status(500).json({ message: "清空购物车失败" });
  }
};
