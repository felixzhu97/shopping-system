'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useState, useEffect } from 'react';
import { updateUserAddress, getUserById } from '@/lib/api/users';
import { getUserId, useUserStore } from '@/lib/store/userStore';
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
import { useCheckoutStore } from '@/lib/store/checkoutStore';
import { CheckoutFormData } from '@/lib/store/checkoutStore';
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
  initialData: CheckoutFormData;
}) {
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // 初始化和更新表单数据
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
      // 确保省份存在于省份列表中
      const province = provinces.find(p => p.name === initialData.province);
      if (province) {
        setSelectedProvince(province.name);
        // 确保城市存在于该省份的城市列表中
        if (province.cities.includes(initialData.city)) {
          setSelectedCity(initialData.city);
        } else {
          setSelectedCity('');
        }
      } else {
        setSelectedProvince('');
        setSelectedCity('');
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedCity(''); // 清空城市选择
    setForm(prev => ({
      ...prev,
      province: value,
      city: '', // 清空城市值
    }));
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setForm(prev => ({
      ...prev,
      city: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!selectedProvince || !selectedCity) {
      setError('请选择省份和城市');
      return;
    }

    // 验证城市是否属于选中的省份
    const province = provinces.find(p => p.name === selectedProvince);
    if (!province || !province.cities.includes(selectedCity)) {
      setError('请选择有效的城市');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...form,
        province: selectedProvince,
        city: selectedCity,
      };
      await onSave(submitData);
      onClose();
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取当前省份的城市列表
  const currentCities = provinces.find(p => p.name === selectedProvince)?.cities || [];

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
        <Label htmlFor="address">详细地址</Label>
        <Input
          id="address"
          name="address"
          value={form.address || ''}
          onChange={handleChange}
          className="mt-1"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="province">省份</Label>
          <Select value={selectedProvince} onValueChange={handleProvinceChange}>
            <SelectTrigger
              id="province"
              className={cn('mt-1', !selectedProvince && 'text-muted-foreground')}
            >
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
            <SelectTrigger
              id="city"
              className={cn('mt-1', !selectedCity && 'text-muted-foreground')}
            >
              <SelectValue placeholder={selectedProvince ? '选择城市' : '请先选择省份'} />
            </SelectTrigger>
            <SelectContent>
              {currentCities.map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="postalCode">邮政编码</Label>
        <Input
          id="postalCode"
          name="postalCode"
          value={form.postalCode || ''}
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
  const { formData, setFormData } = useCheckoutStore();
  const { getCheckoutInfo } = useUserStore();

  useEffect(() => {
    const fetchUserData = async () => {
      const checkoutInfo = await getCheckoutInfo();
      setFormData(checkoutInfo);
    };
    fetchUserData();
  }, [getCheckoutInfo, setFormData]);

  const handleSavePersonalInfo = async (data: any) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('未登录');
      await updateUserAddress(userId, {
        ...data,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      const newData = {
        ...formData,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };
      setFormData(newData);
    } catch (error) {
      throw error;
    }
  };

  const handleSaveAddress = async (data: any) => {
    try {
      const userId = getUserId();
      if (!userId) throw new Error('未登录');
      await updateUserAddress(userId, {
        ...formData,
        ...data,
      });
      const newData = {
        ...formData,
        ...data,
      };
      setFormData(newData);
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
                      {formData.lastName} {formData.firstName}
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setPersonalInfoModalOpen(true)}>
                    编辑
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">手机号码</div>
                    <div className="font-medium">{formData.phone}</div>
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
                      {formData.address}
                      <br />
                      {formData.city && `${formData.city}, `}
                      {formData.province && `${formData.province}, `}
                      {formData.postalCode}
                      <br />
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
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }}
      />
      <EditAddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={formData}
      />
    </div>
  );
}
