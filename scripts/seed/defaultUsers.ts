export const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'Admin123!',
  role: 'admin' as const,
  firstName: 'Admin',
  lastName: 'User',
  phone: '+10000000001',
  address: '1 Admin St',
  city: 'New York',
  province: 'NY',
  postalCode: '10001',
  paymentMethod: 'credit-card',
};

export const DEFAULT_USER = {
  email: 'user@example.com',
  password: 'User123!',
  role: 'user' as const,
  firstName: 'Demo',
  lastName: 'User',
  phone: '+10000000002',
  address: '2 User Ave',
  city: 'Los Angeles',
  province: 'CA',
  postalCode: '90001',
  paymentMethod: 'alipay',
};
