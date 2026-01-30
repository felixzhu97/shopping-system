import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';

export const createOrder = async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let totalAmount = 0;
    const detailedItems = await Promise.all(
      orderItems.map(async (item: any) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
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

    const order = new Order({
      userId,
      items: detailedItems,
      totalAmount,
      status: 'pending',
      shippingAddress,
      paymentMethod,
    });

    await order.save();

    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    res.status(201).json(order);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({
      message: 'Failed to create order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getUserOrders = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200 as number).json(orders);
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    res.status(500 as number).json({ message: 'Failed to fetch user orders' });
  }
};

export const getOrderById = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404 as number).json({ message: 'Order not found' });
    }

    res.status(200 as number).json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    res.status(500 as number).json({ message: 'Failed to fetch order' });
  }
};

export const updateOrderStatus = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400 as number).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404 as number).json({ message: 'Order not found' });
    }

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
    console.error('Failed to update order status:', error);
    res.status(500 as number).json({ message: 'Failed to update order status' });
  }
};

export const getAllOrders = async (req: any, res: any) => {
  try {
    const { status } = req.params;

    const query = status && status !== 'all' ? { status } : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    res.status(200 as number).json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500 as number).json({ message: 'Failed to fetch orders' });
  }
};

export const cancelOrder = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled',
      });
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();

    await Promise.all(
      order.items.map(item =>
        Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        })
      )
    );

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Failed to cancel order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
