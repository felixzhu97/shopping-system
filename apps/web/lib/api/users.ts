import { API_CONFIG, fetchApi } from './config';

// 获取用户信息
export async function getUserById(id: string) {
  const url = `${API_CONFIG.usersUrl}/${id}`;
  const response = await fetchApi(url);
  if (!response.success || !response.data) {
    throw new Error('获取用户信息失败');
  }
  return response.data;
}

// 更新用户信息
export async function updateUserById(id: string, data: any) {
  const url = `${API_CONFIG.usersUrl}/${id}`;
  const response = await fetchApi(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.success || !response.data) {
    throw new Error('更新用户信息失败');
  }
  return response.data;
}
