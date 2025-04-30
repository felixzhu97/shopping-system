import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';

// 创建订单
export const createOrder = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    // 确保用户存在
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 查询所有商品详细信息并计算总金额
    let totalAmount = 0;
    const detailedItems = await Promise.all(
      orderItems.map(async (item: any) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`商品不存在: ${item.productId}`);
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        return {
          productId: item.productId,
          quantity: item.quantity,
          name: product.name,
          image: product.image,
          price: product.price,
          description: product.description,
        };
      })
    );

    // 创建订单
    const order = new Order({
      userId,
      items: detailedItems,
      totalAmount,
      status: 'pending',
      shippingAddress,
      paymentMethod,
    });

    await order.save();

    // 清空购物车 (可选)
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    res.status(201).json(order);
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({
      message: '创建订单失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
};

// 获取用户订单列表
export const getUserOrders = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200 as number).json(orders);
  } catch (error) {
    console.error('获取用户订单失败:', error);
    res.status(500 as number).json({ message: '获取用户订单失败' });
  }
};

// 获取订单详情
export const getOrderById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404 as number).json({ message: '订单不存在' });
    }

    res.status(200 as number).json(order);
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500 as number).json({ message: '获取订单详情失败' });
  }
};

// 更新订单状态
export const updateOrderStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400 as number).json({ message: '无效的订单状态' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404 as number).json({ message: '订单不存在' });
    }

    // 如果订单被取消，恢复库存
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200 as number).json(updatedOrder);
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500 as number).json({ message: '更新订单状态失败' });
  }
};

export const getAllOrders = async (req: any, res: any) => {
  try {
    const { status } = req.params;

    let query = {};
    if (status && status !== 'all') {
      query = { status };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    res.status(200 as number).json(orders);
  } catch (error) {
    console.error('获取所有订单失败:', error);
    res.status(500 as number).json({ message: '获取所有订单失败' });
  }
};

// 取消订单
export const cancelOrder = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在',
      });
    }

    // 只有待处理的订单可以取消
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只有待处理的订单可以取消',
      });
    }

    try {
      // 更新订单状态为已取消
      order.status = 'cancelled';
      const updatedOrder = await order.save();

      // 恢复商品库存
      await Promise.all(
        order.items.map(async item => {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        })
      );

      res.status(200).json({
        success: true,
        data: updatedOrder,
      });
    } catch (saveError) {
      console.error('保存订单状态失败:', saveError);
      res.status(500).json({
        success: false,
        message: '取消订单失败',
        error: '保存订单状态时出错',
      });
    }
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({
      success: false,
      message: '取消订单失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
};
