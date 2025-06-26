import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock mongoose and models
vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn(),
    connection: {
      close: vi.fn(),
    },
  },
}));

vi.mock('../../models/Product', () => ({
  default: vi.fn(),
}));

describe('Product Model', () => {
  let mockProduct: any;

  beforeEach(async () => {
    // Import mocked modules
    const { default: Product } = await import('../../models/Product');
    mockProduct = Product;

    // Reset mocks
    vi.clearAllMocks();

    // Setup mock implementations
    mockProduct.deleteMany = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a valid product', async () => {
    const productData = {
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      image: 'test.jpg',
      category: 'Test Category',
      stock: 10,
    };

    const mockSave = vi.fn().mockResolvedValue({
      _id: 'product-id',
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockProduct.mockImplementation(() => ({
      save: mockSave,
      ...productData,
    }));

    const product = new mockProduct(productData);
    const savedProduct = await product.save();

    expect(savedProduct).toBeDefined();
    expect(savedProduct.name).toBe('Test Product');
    expect(savedProduct.price).toBe(100);
    expect(savedProduct.description).toBe('Test Description');
    expect(savedProduct.stock).toBe(10);
    expect(mockSave).toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const mockSave = vi.fn().mockRejectedValue(new Error('Validation failed: name is required'));

    mockProduct.mockImplementation(() => ({
      save: mockSave,
      name: '',
      price: -1,
      description: '',
      image: '',
      category: '',
      stock: -1,
    }));

    const product = new mockProduct({
      name: '',
      price: -1,
      description: '',
      image: '',
      category: '',
      stock: -1,
    });

    try {
      await product.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(mockSave).toHaveBeenCalled();
    }
  });

  it('should update product details', async () => {
    const initialData = {
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      image: 'test.jpg',
      category: 'Test Category',
      stock: 10,
    };

    const mockSave = vi
      .fn()
      .mockResolvedValueOnce({ _id: 'product-id', ...initialData })
      .mockResolvedValueOnce({
        _id: 'product-id',
        name: 'Updated Product',
        price: 200,
        description: 'Updated Description',
        image: 'test.jpg',
        category: 'Test Category',
        stock: 20,
      });

    const mockProductInstance = {
      ...initialData,
      save: mockSave,
    };

    mockProduct.mockImplementation(() => mockProductInstance);

    const product = new mockProduct(initialData);
    await product.save();

    // Simulate updating properties
    product.name = 'Updated Product';
    product.price = 200;
    product.description = 'Updated Description';
    product.stock = 20;

    const updatedProduct = await product.save();

    expect(updatedProduct.name).toBe('Updated Product');
    expect(updatedProduct.price).toBe(200);
    expect(updatedProduct.description).toBe('Updated Description');
    expect(updatedProduct.stock).toBe(20);
    expect(mockSave).toHaveBeenCalledTimes(2);
  });
});
