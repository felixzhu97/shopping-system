import { Request, Response } from 'express';
import { Product as SharedProduct } from 'shared';
import Product from '../models/Product';

// 获取所有产品
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    console.log('查询参数:', req.query);
    console.log('类别查询:', category);

    let query = {};
    if (category) {
      // 处理类别格式差异
      if (typeof category === 'string') {
        // 将"home-kitchen"转换为"Home & Kitchen"的特殊处理
        if (
          category.toLowerCase() === 'home-kitchen' ||
          category.toLowerCase() === 'home & kitchen'
        ) {
          query = {
            $or: [
              { category: 'Home & Kitchen' },
              { category: 'Home-Kitchen' },
              { category: category },
            ],
          };
        } else {
          // 使用正则表达式以提供大小写不敏感的匹配
          query = { category: new RegExp(category, 'i') };
        }
      } else {
        query = { category };
      }
    }

    console.log('数据库查询条件:', JSON.stringify(query));

    const products = await Product.find(query);
    console.log(`找到 ${products.length} 个产品`);

    res.status(200 as number).json(products);
  } catch (error) {
    console.error('获取产品列表失败:', error);
    res.status(500 as number).json({ message: '获取产品列表失败' });
  }
};

// 获取单个产品
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404 as number).json({ message: '产品不存在' });
    }

    res.status(200 as number).json(product);
  } catch (error) {
    console.error('获取产品详情失败:', error);
    res.status(500 as number).json({ message: '获取产品详情失败' });
  }
};

// 创建产品
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData: Omit<SharedProduct, 'id'> = req.body;
    const newProduct = new Product(productData);

    const savedProduct = await newProduct.save();
    res.status(201 as number).json(savedProduct);
  } catch (error) {
    console.error('创建产品失败:', error);
    res.status(500 as number).json({ message: '创建产品失败' });
  }
};

// 更新产品
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productData: Partial<Omit<SharedProduct, 'id'>> = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404 as number).json({ message: '产品不存在' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });

    res.status(200 as number).json(updatedProduct);
  } catch (error) {
    console.error('更新产品失败:', error);
    res.status(500 as number).json({ message: '更新产品失败' });
  }
};

// 删除产品
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404 as number).json({ message: '产品不存在' });
    }

    await Product.findByIdAndDelete(id);

    res.status(200 as number).json({ message: '产品已删除' });
  } catch (error) {
    console.error('删除产品失败:', error);
    res.status(500 as number).json({ message: '删除产品失败' });
  }
};
