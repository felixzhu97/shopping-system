'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { updateUserAddress, getUserById } from '@/lib/api/users';
import { getUserId } from '@/lib/store/userStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { provinces } from '@/components/china-region';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

// 基础弹出层组件
interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  error?: string | null;
}

function BaseModal({ open, onClose, title, children, onSubmit, loading, error }: BaseModalProps) {
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
        <h2 className="text-2xl font-semibold text-center mb-8">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          {error && (
            <div className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
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

// 个人信息编辑弹出层
function EditPersonalInfoModal({
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

  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="编辑个人信息"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    >
      <div className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor="lastName">姓</Label>
          <Input
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="mt-1"
            required
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="firstName">名</Label>
          <Input
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="mt-1"
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">手机号码</Label>
        <Input
          id="phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="mt-1"
          required
        />
      </div>
    </BaseModal>
  );
}

// 地址编辑弹出层
function EditAddressModal({
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
  const [selectedProvince, setSelectedProvince] = useState(initialData.province || '');
  const [selectedCity, setSelectedCity] = useState(initialData.city || '');

  useEffect(() => {
    setForm(initialData);
    setSelectedProvince(initialData.province || '');
    setSelectedCity(initialData.city || '');
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity('');
    setForm({ ...form, province: value, city: '' });
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setForm({ ...form, city: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="编辑收货地址"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    >
      <div>
        <Label htmlFor="street">街道地址</Label>
        <Input
          id="street"
          name="street"
          value={form.street}
          onChange={handleChange}
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="apt">门牌号/单元（可选）</Label>
        <Input id="apt" name="apt" value={form.apt} onChange={handleChange} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="province">省份</Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger id="province" className="mt-1">
              <SelectValue placeholder="选择省份" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map(prov => (
                <SelectItem key={prov.name} value={prov.name}>
                  {prov.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="city">城市</Label>
          <Select
            value={selectedCity}
            onValueChange={handleCityChange}
            disabled={!selectedProvince}
          >
            <SelectTrigger id="city" className="mt-1">
              <SelectValue placeholder={selectedProvince ? '选择城市' : '请先选择省份'} />
            </SelectTrigger>
            <SelectContent>
              {(provinces.find(p => p.name === selectedProvince)?.cities || []).map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="zip">邮政编码</Label>
        <Input
          id="zip"
          name="zip"
          value={form.zip}
          onChange={handleChange}
          className="mt-1"
          required
        />
      </div>
    </BaseModal>
  );
}

export default function AccountPage() {
  const [personalInfoModalOpen, setPersonalInfoModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      apt: '',
      city: '',
      province: '',
      zip: '',
      country: '中国',
      firstName: '',
      lastName: '',
      company: '',
      phone: '',
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = getUserId();
        if (!userId) return;
        const data = await getUserById(userId);
        setUserData(data);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSavePersonalInfo = async (data: any) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('未登录');
      await updateUserAddress(userId, {
        ...userData.address,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      setUserData(prev => ({
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      }));
    } catch (error) {
      throw error;
    }
  };

  const handleSaveAddress = async (data: any) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('未登录');
      await updateUserAddress(userId, {
        ...userData.address,
        ...data,
      });
      setUserData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          ...data,
        },
      }));
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-6">账号设置</h1>

          {/* 个人信息 */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">个人信息</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">姓名</div>
                    <div className="font-medium">
                      {userData.lastName} {userData.firstName}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setPersonalInfoModalOpen(true)}>
                    编辑
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">手机号码</div>
                    <div className="font-medium">{userData.phone}</div>
                  </div>
                  <Button variant="ghost" onClick={() => setPersonalInfoModalOpen(true)}>
                    编辑
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 收货地址 */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">收货地址</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">默认地址</div>
                    <div className="font-medium">
                      {userData.address.street}
                      {userData.address.apt && `, ${userData.address.apt}`}
                      <br />
                      {userData.address.city && `${userData.address.city}, `}
                      {userData.address.province && `${userData.address.province}, `}
                      {userData.address.zip}
                      <br />
                      {userData.address.country}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setAddressModalOpen(true)}>
                    编辑
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 支付方式 */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">支付方式</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">默认支付方式</div>
                    <div className="font-medium">未设置</div>
                  </div>
                  <Button variant="ghost">添加</Button>
                </div>
              </div>
            </div>
          </div>

          {/* 隐私设置 */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">隐私设置</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">数据收集</div>
                    <div className="font-medium">管理您的数据收集偏好</div>
                  </div>
                  <Button variant="ghost">管理</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* 弹出层 */}
      <EditPersonalInfoModal
        open={personalInfoModalOpen}
        onClose={() => setPersonalInfoModalOpen(false)}
        onSave={handleSavePersonalInfo}
        initialData={{
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
        }}
      />
      <EditAddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={userData.address}
      />
    </div>
  );
}
