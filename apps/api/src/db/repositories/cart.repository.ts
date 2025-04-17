import Cart, { CartDocument } from '../../models/Cart';
import { CartItem } from 'shared/dist';
import { Repository } from '../repository';
import mongoose from 'mongoose';

/**
 * 购物车仓库接口
 */
export interface CartRepositoryInterface {
  findByUserId(userId: string): Promise<CartDocument | null>;
  addItem(userId: string, item: CartItem): Promise<CartDocument | null>;
  updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartDocument | null>;
  removeItem(userId: string, productId: string): Promise<CartDocument | null>;
  clearCart(userId: string): Promise<CartDocument | null>;
}

/**
 * 购物车数据仓库类
 * 提供购物车模型的数据访问方法
 */
export class CartRepository
  extends Repository<CartDocument, any>
  implements CartRepositoryInterface
{
  constructor() {
    super(Cart);
  }

  /**
   * 根据用户ID查找购物车
   * @param userId 用户ID
   * @returns 购物车文档或null
   */
  async findByUserId(userId: string): Promise<CartDocument | null> {
    return this.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  }

  /**
   * 添加商品到购物车
   * @param userId 用户ID
   * @param item 购物车商品
   * @returns 更新后的购物车
   */
  async addItem(userId: string, item: CartItem): Promise<CartDocument | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 查找用户购物车
    let cart = await this.findOne({ userId: userObjectId });

    if (!cart) {
      // 如果购物车不存在，创建新购物车
      cart = await this.create({
        userId: userObjectId,
        items: [item],
      });
      return cart;
    }

    // 检查商品是否已存在于购物车
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.productId.toString() === item.productId
    );

    if (existingItemIndex !== -1) {
      // 如果商品已存在，更新数量
      cart.items[existingItemIndex].quantity += item.quantity;
    } else {
      // 如果商品不存在，添加到购物车
      cart.items.push(item);
    }

    await cart.save();
    return cart;
  }

  /**
   * 更新购物车商品数量
   * @param userId 用户ID
   * @param productId 产品ID
   * @param quantity 新数量
   * @returns 更新后的购物车
   */
  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<CartDocument | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await this.findOne({ userId: userObjectId });

    if (!cart) return null;

    // 查找商品
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) return cart;

    if (quantity <= 0) {
      // 如果数量小于等于0，从购物车移除商品
      cart.items.splice(itemIndex, 1);
    } else {
      // 更新商品数量
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return cart;
  }

  /**
   * 从购物车移除商品
   * @param userId 用户ID
   * @param productId 产品ID
   * @returns 更新后的购物车
   */
  async removeItem(userId: string, productId: string): Promise<CartDocument | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await this.findOne({ userId: userObjectId });

    if (!cart) return null;

    // 过滤掉要移除的商品
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);

    await cart.save();
    return cart;
  }

  /**
   * 清空购物车
   * @param userId 用户ID
   * @returns 更新后的购物车
   */
  async clearCart(userId: string): Promise<CartDocument | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await this.findOne({ userId: userObjectId });

    if (!cart) return null;

    cart.items = [];

    await cart.save();
    return cart;
  }
}

// 导出单例实例
export const cartRepository = new CartRepository();
