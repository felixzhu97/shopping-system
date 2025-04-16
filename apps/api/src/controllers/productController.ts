import { Request, Response } from "express";
import Product from "../models/Product";

// 获取所有产品
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category) {
      query = { category };
    }

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    console.error("获取产品列表失败:", error);
    res.status(500).json({ message: "获取产品列表失败" });
  }
};

// 获取单个产品
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "产品不存在" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("获取产品详情失败:", error);
    res.status(500).json({ message: "获取产品详情失败" });
  }
};

// 创建产品
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      image,
      category,
      stock,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("创建产品失败:", error);
    res.status(500).json({ message: "创建产品失败" });
  }
};

// 更新产品
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, stock } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "产品不存在" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, image, category, stock },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("更新产品失败:", error);
    res.status(500).json({ message: "更新产品失败" });
  }
};

// 删除产品
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "产品不存在" });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "产品已删除" });
  } catch (error) {
    console.error("删除产品失败:", error);
    res.status(500).json({ message: "删除产品失败" });
  }
};
