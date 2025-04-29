'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { updateUserAddress, getUserById } from '@/lib/api/users';
import { getUserId } from '@/lib/utils/user';

function EditShippingAddressModal({
  open,
  onClose,
  onSave,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: any;
}) {
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userId = getUserId();
      if (!userId) throw new Error('未登录');
      await onSave(form);
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative animate-fade-in">
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="关闭"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold text-center mb-8">编辑收货地址</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <input
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="姓"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
            <input
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="名"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="公司名称（可选）"
            name="company"
            value={form.company}
            onChange={handleChange}
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="街道地址"
            name="street"
            value={form.street}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="门牌/单元（可选）"
            name="apt"
            value={form.apt}
            onChange={handleChange}
          />
          <div className="flex gap-3">
            <input
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="邮编"
              name="zip"
              value={form.zip}
              onChange={handleChange}
              required
            />
            <input
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="城市/省份"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="国家/地区"
            name="country"
            value={form.country}
            onChange={handleChange}
            required
          />
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="手机号"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <div className="text-xs text-gray-500 mt-1">手机号提交后不可更改，请确保填写正确。</div>
          <div className="text-xs text-red-500">{error}</div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold text-lg transition"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 font-semibold text-lg transition"
              onClick={onClose}
              disabled={loading}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [shipping, setShipping] = useState({
    lastName: '',
    firstName: '',
    company: '',
    street: '',
    apt: '',
    zip: '',
    city: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;
        const userData = await getUserById(userId);
        if (userData.address) {
          setShipping(userData.address);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveAddress = async (data: any) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('未登录');
      await updateUserAddress(userId, data);
      setShipping(data);
      setModalOpen(false);
    } catch (error) {
      console.error('保存地址失败:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-semibold mb-10 text-center">账号设置</h1>
          <div className="space-y-10">
            {/* 收货信息 */}
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
              <div className="w-32 font-semibold text-gray-800 mb-2 md:mb-0">收货信息</div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-gray-500 text-sm mb-1">收货地址</div>
                  <div className="mb-1">
                    {shipping.lastName}
                    {shipping.firstName}
                    <br />
                    {shipping.street}
                    {shipping.apt && `, ${shipping.apt}`}
                    <br />
                    {shipping.city}, {shipping.zip}
                    <br />
                    {shipping.country}
                  </div>
                  <Button asChild variant="link" className="px-0 h-auto text-blue-600">
                    <span onClick={() => setModalOpen(true)} style={{ cursor: 'pointer' }}>
                      编辑
                    </span>
                  </Button>
                </div>
                <div>
                  <div className="text-gray-500 text-sm mb-1">联系方式</div>
                  <div className="mb-1">{shipping.phone}</div>
                  <Button asChild variant="link" className="px-0 h-auto text-blue-600">
                    <span onClick={() => setModalOpen(true)} style={{ cursor: 'pointer' }}>
                      编辑
                    </span>
                  </Button>
                </div>
              </div>
            </div>
            {/* 支付信息 */}
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
              <div className="w-32 font-semibold text-gray-800 mb-2 md:mb-0">支付信息</div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-gray-500 text-sm mb-1">账单联系人</div>
                  <Button asChild variant="link" className="px-0 h-auto text-blue-600">
                    <Link href="#">编辑</Link>
                  </Button>
                </div>
                <div>
                  <div className="text-gray-500 text-sm mb-1">账单地址</div>
                  <Button asChild variant="link" className="px-0 h-auto text-blue-600">
                    <Link href="#">编辑</Link>
                  </Button>
                </div>
                <div>
                  <div className="text-gray-500 text-sm mb-1">支付方式</div>
                  <Button asChild variant="link" className="px-0 h-auto text-blue-600">
                    <Link href="#">编辑</Link>
                  </Button>
                </div>
              </div>
            </div>
            {/* 隐私 */}
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
              <div className="w-32 font-semibold text-gray-800 mb-2 md:mb-0">隐私</div>
              <div className="flex-1">
                <div className="text-gray-500 text-sm mb-1">个人信息</div>
                <div className="mb-1 text-sm text-gray-700">
                  您可以随时管理或删除您的个人信息，平台致力于保护您的隐私。
                </div>
                <Button asChild variant="link" className="px-0 h-auto text-blue-600">
                  <Link href="#">管理个人信息</Link>
                </Button>
              </div>
            </div>
            {/* 账号信息 */}
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
              <div className="w-32 font-semibold text-gray-800 mb-2 md:mb-0">账号信息</div>
              <div className="flex-1">
                <div className="mb-1">zhuzhiqiang@example.com</div>
                <Button asChild variant="link" className="px-0 h-auto text-blue-600">
                  <Link href="#">管理账号</Link>
                </Button>
                <div className="mt-4 text-xs text-gray-500">您的账号用于登录和访问平台服务。</div>
                <div className="flex gap-2 mt-3">
                  {/* 可替换为平台相关icon */}
                  <span className="inline-block w-6 h-6 bg-gray-200 rounded-full" />
                  <span className="inline-block w-6 h-6 bg-gray-200 rounded-full" />
                  <span className="inline-block w-6 h-6 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <EditShippingAddressModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={shipping}
      />
    </div>
  );
}
