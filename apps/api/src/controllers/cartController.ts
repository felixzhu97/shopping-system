import Cart from '../models/Cart';
import Product from '../models/Product';
import mongoose from 'mongoose';

// 获取用户购物车
export const getCart = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    // 检查用户ID是否为有效的ObjectId
    const isValidObjectId = mongoose.isValidObjectId(userId);

    // 根据userId查询购物车
    let cart;
    if (isValidObjectId) {
      cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        select: 'name price image description',
      });
    } else {
      // 如果userId不是有效的ObjectId，尝试根据字符串标识符查找
      cart = null; // 非有效ObjectId时直接创建新购物车
    }

    if (!cart) {
      // 如果用户没有购物车，创建一个空购物车
      cart = new Cart({
        userId: isValidObjectId ? userId : new mongoose.Types.ObjectId(), // 如果不是有效的ObjectId就创建一个新的
        items: [],
      });
      await cart.save();
    }

    // 转换为前端期望的格式
    const cartItems = cart.items.map(item => {
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

    res.status(200 as number).json({
      id: cart._id,
      userId,
      items: cartItems,
    });
  } catch (error) {
    console.error('获取购物车失败:', error);
    res.status(500 as number).json({ message: '获取购物车失败' });
  }
};

// 添加商品到购物车
export const addToCart = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    // 验证产品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404 as number).json({ message: '产品不存在' });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400 as number).json({ message: '库存不足' });
    }

    // 检查用户ID是否为有效的ObjectId
    const isValidObjectId = mongoose.isValidObjectId(userId);

    // 查找或创建购物车
    let cart;
    if (isValidObjectId) {
      cart = await Cart.findOne({ userId });
    } else {
      // 如果不是有效的ObjectId，尝试创建一个新的购物车
      cart = null;
    }

    if (!cart) {
      cart = new Cart({
        userId: isValidObjectId ? userId : new mongoose.Types.ObjectId(),
        items: [],
      });
    }

    // 检查产品是否已在购物车中
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex > -1) {
      // 更新现有产品数量
      cart.items[itemIndex].quantity += quantity;
    } else {
      // 添加新产品到购物车
      cart.items.push({
        productId, // 直接使用productId，因为它已经是ObjectId或字符串格式
        quantity,
      });
    }

    await cart.save();

    // 返回更新后的购物车
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image description',
    });

    res.status(200 as number).json(updatedCart);
  } catch (error) {
    console.error('添加商品到购物车失败:', error);
    res.status(500 as number).json({ message: '添加商品到购物车失败' });
  }
};

// 更新购物车商品数量
export const updateCartItem = async (req: any, res: any) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    // 检查用户ID是否为有效的ObjectId
    const isValidObjectId = mongoose.isValidObjectId(userId);

    // 查找购物车
    let cart;
    if (isValidObjectId) {
      cart = await Cart.findOne({ userId });
    } else {
      // 使用其他方式查找购物车，例如根据字符串标识符
      cart = null;
    }

    if (!cart) {
      return res.status(404 as number).json({ message: '购物车不存在' });
    }

    // 更新商品数量
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404 as number).json({ message: '购物车中没有此商品' });
    }

    if (quantity <= 0) {
      // 如果数量小于等于0，从购物车中移除
      cart.items.splice(itemIndex, 1);
    } else {
      // 更新数量
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    // 返回更新后的购物车
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image description',
    });

    res.status(200 as number).json(updatedCart);
  } catch (error) {
    console.error('更新购物车商品数量失败:', error);
    res.status(500 as number).json({ message: '更新购物车商品数量失败' });
  }
};

// 从购物车移除商品
export const removeFromCart = async (req: any, res: any) => {
  try {
    const { userId, productId } = req.params;

    // 检查用户ID是否为有效的ObjectId
    const isValidObjectId = mongoose.isValidObjectId(userId);

    // 查找购物车
    let cart;
    if (isValidObjectId) {
      cart = await Cart.findOne({ userId });
    } else {
      // 使用其他方式查找购物车
      cart = null;
    }

    if (!cart) {
      return res.status(404 as number).json({ message: '购物车不存在' });
    }

    // 检查商品是否在购物车中
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404 as number).json({ message: '购物车中没有此商品' });
    }

    // 从购物车中移除商品
    cart.items.splice(itemIndex, 1);
    await cart.save();

    // 返回更新后的购物车
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.productId',
      select: 'name price image description',
    });

    res.status(200 as number).json(updatedCart);
  } catch (error) {
    console.error('从购物车移除商品失败:', error);
    res.status(500 as number).json({ message: '从购物车移除商品失败' });
  }
};

// 清空购物车
export const clearCart = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    // 检查用户ID是否为有效的ObjectId
    const isValidObjectId = mongoose.isValidObjectId(userId);

    // 查找购物车
    let cart;
    if (isValidObjectId) {
      cart = await Cart.findOne({ userId });
    } else {
      cart = null;
    }

    if (!cart) {
      return res.status(404 as number).json({ message: '购物车不存在' });
    }

    // 清空购物车项目
    cart.items = [];
    await cart.save();

    res.status(200 as number).json({ message: '购物车已清空' });
  } catch (error) {
    console.error('清空购物车失败:', error);
    res.status(500 as number).json({ message: '清空购物车失败' });
  }
};
