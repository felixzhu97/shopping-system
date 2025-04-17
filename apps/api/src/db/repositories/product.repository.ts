import Product, { ProductDocument, ProductType } from '../../models/Product';
import { Repository } from '../repository';

/**
 * 产品数据仓库类
 * 提供产品模型的数据访问方法
 */
export class ProductRepository extends Repository<ProductDocument, ProductType> {
  constructor() {
    super(Product);
  }

  /**
   * 根据类别查找产品
   * @param category 产品类别
   * @returns 产品列表
   */
  async findByCategory(category: string): Promise<ProductDocument[]> {
    return this.findAll({ category });
  }

  /**
   * 查找价格区间内的产品
   * @param minPrice 最低价格
   * @param maxPrice 最高价格
   * @returns 产品列表
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<ProductDocument[]> {
    return this.findAll({
      price: { $gte: minPrice, $lte: maxPrice },
    });
  }

  /**
   * 查找有库存的产品
   * @returns 有库存的产品列表
   */
  async findInStock(): Promise<ProductDocument[]> {
    return this.findAll({ stock: { $gt: 0 } });
  }

  /**
   * 更新产品库存
   * @param productId 产品ID
   * @param quantity 变更数量（正数增加，负数减少）
   * @returns 更新后的产品
   */
  async updateStock(productId: string, quantity: number): Promise<ProductDocument | null> {
    try {
      const product = await this.findById(productId);
      if (!product) return null;

      const newStock = Math.max(0, product.stock + quantity);
      return this.update(productId, { stock: newStock });
    } catch (error) {
      console.error(`[ProductRepository] 更新库存错误:`, error);
      throw error;
    }
  }

  /**
   * 搜索产品
   * @param keyword 搜索关键词
   * @returns 匹配的产品列表
   */
  async searchProducts(keyword: string): Promise<ProductDocument[]> {
    const regex = new RegExp(keyword, 'i');
    return this.findAll({
      $or: [{ name: regex }, { description: regex }, { category: regex }],
    });
  }
}

// 导出单例实例
export const productRepository = new ProductRepository();
