import { ApiResponse, Cart } from 'shared';
import { API_CONFIG, fetchApi } from './config';

export async function getCart(userId: string): Promise<Cart> {
  const url = `${API_CONFIG.cartUrl}/${userId}`;
  const response = await fetchApi<Cart>(url);

  if (!response.success || !response.data) {
    return { items: [] };
  }

  return response.data;
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.cartUrl}/${userId}`;
  return fetchApi<Cart>(url, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.cartUrl}/${userId}/item/${productId}`;
  return fetchApi<Cart>(url, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(
  userId: string,
  productId: string
): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.cartUrl}/${userId}/item/${productId}`;
  return fetchApi<Cart>(url, {
    method: 'DELETE',
  });
}

export async function clearCart(userId: string): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.cartUrl}/${userId}`;
  return fetchApi<Cart>(url, {
    method: 'DELETE',
  });
}
