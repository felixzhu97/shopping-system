import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";

const router = express.Router();

// 获取所有产品
router.get("/", getAllProducts);

// 获取单个产品
router.get("/:id", getProductById);

// 创建产品
router.post("/", createProduct);

// 更新产品
router.put("/:id", updateProduct);

// 删除产品
router.delete("/:id", deleteProduct);

export default router;
