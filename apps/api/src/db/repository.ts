import { Document, Model, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

/**
 * 通用数据库仓库类
 * 实现对MongoDB模型的基本CRUD操作
 *
 * @template T 文档接口类型
 * @template K 数据传输对象类型
 */
export class Repository<T extends Document, K> {
  /**
   * 构造函数
   * @param model Mongoose模型
   */
  constructor(private model: Model<T>) {}

  /**
   * 创建新文档
   * @param data 要创建的数据
   * @returns 新创建的文档
   */
  async create(data: K): Promise<T> {
    try {
      const newRecord = new this.model(data);
      return await newRecord.save();
    } catch (error) {
      console.error(`[Repository] 创建文档错误:`, error);
      throw error;
    }
  }

  /**
   * 根据ID查找文档
   * @param id 文档ID
   * @returns 找到的文档或null
   */
  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findById(id);
    } catch (error) {
      console.error(`[Repository] 根据ID查找文档错误:`, error);
      throw error;
    }
  }

  /**
   * 根据条件查找单个文档
   * @param filter 查询条件
   * @returns 找到的文档或null
   */
  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOne(filter);
    } catch (error) {
      console.error(`[Repository] 查找单个文档错误:`, error);
      throw error;
    }
  }

  /**
   * 查找所有符合条件的文档
   * @param filter 查询条件
   * @returns 文档数组
   */
  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    try {
      return await this.model.find(filter);
    } catch (error) {
      console.error(`[Repository] 查找所有文档错误:`, error);
      throw error;
    }
  }

  /**
   * 更新文档
   * @param id 文档ID
   * @param updateData 更新数据
   * @returns 更新后的文档
   */
  async update(id: string, updateData: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        updateData,
        { new: true } // 返回更新后的文档
      );
    } catch (error) {
      console.error(`[Repository] 更新文档错误:`, error);
      throw error;
    }
  }

  /**
   * 删除文档
   * @param id 文档ID
   * @returns 删除的文档
   */
  async delete(id: string): Promise<T | null> {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      console.error(`[Repository] 删除文档错误:`, error);
      throw error;
    }
  }

  /**
   * 查询带分页的文档
   * @param filter 查询条件
   * @param page 页码
   * @param limit 每页条数
   * @param sort 排序条件
   * @returns 分页结果
   */
  async findWithPagination(
    filter: FilterQuery<T> = {},
    page: number = 1,
    limit: number = 10,
    sort: any = { createdAt: -1 }
  ): Promise<{ data: T[]; total: number; page: number; limit: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      const total = await this.model.countDocuments(filter);
      const data = await this.model.find(filter).sort(sort).skip(skip).limit(limit);

      return {
        data,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error(`[Repository] 分页查询错误:`, error);
      throw error;
    }
  }

  /**
   * 统计文档数量
   * @param filter 查询条件
   * @returns 文档数量
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      console.error(`[Repository] 统计文档数量错误:`, error);
      throw error;
    }
  }

  /**
   * 执行聚合操作
   * @param pipeline 聚合管道
   * @returns 聚合结果
   */
  async aggregate(pipeline: any[]): Promise<any[]> {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      console.error(`[Repository] 聚合操作错误:`, error);
      throw error;
    }
  }
}
