import { useState } from 'react';
import { useUserStore } from '@/lib/user-store';
import { login, register } from '@/lib/api/auth';

// 生成随机邮箱
function generateRandomEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let name = '';
  for (let i = 0; i < 8; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${name}@example.com`;
}

// 生成强密码（大写、小写、数字、特殊字符，12位）
function generateStrongPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const special = '!@#$%^&*()_+-=';
  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += nums[Math.floor(Math.random() * nums.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  const all = upper + lower + nums + special;
  for (let i = 0; i < 8; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd;
}

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState(generateRandomEmail());
  const [password, setPassword] = useState(generateStrongPassword());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setToken = useUserStore(state => state.setToken);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // 先尝试登录
      const user = await login(email, password);
      setToken(user);
      onClose();
    } catch (e: any) {
      // 如果是用户不存在或用户名/邮箱错误，则自动注册再登录
      if (
        e.message?.includes('用户名或密码错误') ||
        e.message?.includes('用户不存在') ||
        e.message?.includes('邮箱')
      ) {
        try {
          await register(email, password);
          // 注册成功后再登录
          const user = await login(email, password);
          setToken(user);
          onClose();
        } catch (regErr: any) {
          setError(regErr.message);
        }
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">用户登录</h2>
        <input
          className="w-full border rounded p-2 mb-2"
          placeholder="邮箱"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2 mb-2"
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button
          className="w-full bg-blue-600 text-white rounded p-2"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '登录中...' : '登录'}
        </button>
        <button className="w-full mt-2 text-gray-500" onClick={onClose}>
          取消
        </button>
      </div>
    </div>
  );
}
