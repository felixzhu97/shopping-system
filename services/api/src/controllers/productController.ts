import { Request, Response } from 'express';
import { Product as SharedProduct } from 'types';
import Product from '../models/Product';
import { mapNormalizedKey, parseCsvToRows } from '../utils/parseCsv';

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

type CsvImportError = {
  rowNumber: number;
  message: string;
  values: Record<string, string>;
};

function parseBoolean(value: string): boolean | undefined {
  const v = value.trim().toLowerCase();
  if (!v) return undefined;
  if (['true', '1', 'yes', 'y'].includes(v)) return true;
  if (['false', '0', 'no', 'n'].includes(v)) return false;
  return undefined;
}

function parseNumber(value: string): number | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  return undefined;
}

function parseInteger(value: string): number | undefined {
  const v = value.trim();
  if (!v) return undefined;
  const n = Number.parseInt(v, 10);
  if (Number.isFinite(n)) return n;
  return undefined;
}

export const importProductsFromCsv = async (req: Request, res: Response) => {
  try {
    const csvText = typeof req.body === 'string' ? req.body : '';
    if (!csvText.trim()) {
      return res.status(400 as number).json({ message: 'CSV内容为空' });
    }

    const { rows } = parseCsvToRows(csvText);
    if (rows.length === 0) {
      return res.status(400 as number).json({ message: 'CSV没有数据行' });
    }

    const errors: CsvImportError[] = [];
    const products: Array<Omit<SharedProduct, 'id'>> = [];

    for (const r of rows) {
      const name = mapNormalizedKey(r.values, ['name']);
      const description = mapNormalizedKey(r.values, ['description', 'desc']);
      const priceRaw = mapNormalizedKey(r.values, ['price']);
      const image = mapNormalizedKey(r.values, ['image', 'imageUrl', 'imageURL']);
      const category = mapNormalizedKey(r.values, ['category']);
      const stockRaw = mapNormalizedKey(r.values, ['stock']);
      const modelKey = mapNormalizedKey(r.values, ['modelKey', 'model_key']);
      const originalPriceRaw = mapNormalizedKey(r.values, ['originalPrice', 'original_price']);
      const inStockRaw = mapNormalizedKey(r.values, ['inStock', 'in_stock']);
      const ratingRaw = mapNormalizedKey(r.values, ['rating']);
      const reviewCountRaw = mapNormalizedKey(r.values, ['reviewCount', 'review_count']);

      const price = priceRaw ? parseNumber(priceRaw) : undefined;
      const stock = stockRaw ? parseInteger(stockRaw) : undefined;
      const originalPrice = originalPriceRaw ? parseNumber(originalPriceRaw) : undefined;
      const inStock = inStockRaw ? parseBoolean(inStockRaw) : undefined;
      const rating = ratingRaw ? parseNumber(ratingRaw) : undefined;
      const reviewCount = reviewCountRaw ? parseInteger(reviewCountRaw) : undefined;

      const missing: string[] = [];
      if (!name?.trim()) missing.push('name');
      if (!description?.trim()) missing.push('description');
      if (price === undefined) missing.push('price');
      if (!image?.trim()) missing.push('image');
      if (!category?.trim()) missing.push('category');
      if (stock === undefined) missing.push('stock');

      if (missing.length > 0) {
        errors.push({
          rowNumber: r.rowNumber,
          message: `缺少或无效字段: ${missing.join(', ')}`,
          values: r.values,
        });
        continue;
      }

      if (!name || !description || !image || !category || price === undefined || stock === undefined) {
        errors.push({
          rowNumber: r.rowNumber,
          message: 'Invalid row data',
          values: r.values,
        });
        continue;
      }

      products.push({
        name: name.trim(),
        description: description.trim(),
        price,
        image: image.trim(),
        category: category.trim(),
        stock,
        modelKey: modelKey?.trim() || undefined,
        originalPrice,
        inStock: inStock ?? true,
        rating: rating ?? 0,
        reviewCount: reviewCount ?? 0,
      });
    }

    if (products.length === 0) {
      return res.status(400 as number).json({
        message: '没有可导入的有效数据行',
        createdCount: 0,
        errors,
      });
    }

    const created = await Product.insertMany(products, { ordered: true });
    const createdIds = created.map((p: any) => p.id ?? p._id).filter(Boolean);

    res.status(201 as number).json({
      createdCount: created.length,
      createdIds,
      errors,
    });
  } catch (error) {
    console.error('CSV导入产品失败:', error);
    res.status(500 as number).json({ message: 'CSV导入产品失败' });
  }
};

type JsonImportError = {
  index: number;
  message: string;
  value: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export const importProductsFromJson = async (req: Request, res: Response) => {
  try {
    const body = req.body as unknown;
    const items = Array.isArray(body)
      ? body
      : isRecord(body) && Array.isArray(body['products'])
        ? (body['products'] as unknown[])
        : null;

    if (!items) {
      return res.status(400 as number).json({ message: 'Invalid JSON payload' });
    }

    if (items.length === 0) {
      return res.status(400 as number).json({ message: 'No products to import' });
    }

    const errors: JsonImportError[] = [];
    const products: Array<Omit<SharedProduct, 'id'>> = [];

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (!isRecord(item)) {
        errors.push({ index: i, message: 'Invalid product object', value: item });
        continue;
      }

      const name = typeof item['name'] === 'string' ? item['name'].trim() : '';
      const description = typeof item['description'] === 'string' ? item['description'].trim() : '';
      const image = typeof item['image'] === 'string' ? item['image'].trim() : '';
      const category = typeof item['category'] === 'string' ? item['category'].trim() : '';
      const modelKey = typeof item['modelKey'] === 'string' ? item['modelKey'].trim() : '';

      const priceValue = item['price'];
      const stockValue = item['stock'];
      const originalPriceValue = item['originalPrice'];
      const inStockValue = item['inStock'];
      const ratingValue = item['rating'];
      const reviewCountValue = item['reviewCount'];

      const price = typeof priceValue === 'number' ? priceValue : parseNumber(String(priceValue ?? ''));
      const stock = typeof stockValue === 'number' ? stockValue : parseInteger(String(stockValue ?? ''));
      const originalPrice =
        typeof originalPriceValue === 'number'
          ? originalPriceValue
          : parseNumber(String(originalPriceValue ?? ''));
      const inStock =
        typeof inStockValue === 'boolean'
          ? inStockValue
          : parseBoolean(String(inStockValue ?? ''));
      const rating =
        typeof ratingValue === 'number' ? ratingValue : parseNumber(String(ratingValue ?? ''));
      const reviewCount =
        typeof reviewCountValue === 'number'
          ? reviewCountValue
          : parseInteger(String(reviewCountValue ?? ''));

      const missing: string[] = [];
      if (!name) missing.push('name');
      if (!description) missing.push('description');
      if (price === undefined) missing.push('price');
      if (!image) missing.push('image');
      if (!category) missing.push('category');
      if (stock === undefined) missing.push('stock');

      if (missing.length > 0) {
        errors.push({
          index: i,
          message: `Missing or invalid fields: ${missing.join(', ')}`,
          value: item,
        });
        continue;
      }

      if (!name || !description || !image || !category || price === undefined || stock === undefined) {
        errors.push({ index: i, message: 'Invalid product data', value: item });
        continue;
      }

      products.push({
        name,
        description,
        price,
        image,
        category,
        stock,
        modelKey: modelKey || undefined,
        originalPrice: originalPrice ?? undefined,
        inStock: inStock ?? true,
        rating: rating ?? 0,
        reviewCount: reviewCount ?? 0,
      });
    }

    if (products.length === 0) {
      return res.status(400 as number).json({
        message: 'No valid products to import',
        createdCount: 0,
        errors,
      });
    }

    const created = await Product.insertMany(products, { ordered: true });
    const createdIds = created.map((p: any) => p.id ?? p._id).filter(Boolean);

    res.status(201 as number).json({
      createdCount: created.length,
      createdIds,
      errors,
    });
  } catch (error) {
    console.error('Failed to import products from JSON:', error);
    res.status(500 as number).json({ message: 'Failed to import products from JSON' });
  }
};
