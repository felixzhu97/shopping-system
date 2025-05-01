import { render, screen } from '@testing-library/react';
import { Footer } from '../components/footer';
import { describe, it, expect } from 'vitest';

describe('Footer', () => {
  it('应该正确渲染 Footer 组件', () => {
    render(<Footer />);
    
    // 检查导航标题
    expect(screen.getByText('商品与服务')).toBeInTheDocument();
    expect(screen.getByText('账户')).toBeInTheDocument();
    expect(screen.getByText('购物指南')).toBeInTheDocument();
    expect(screen.getByText('关于我们')).toBeInTheDocument();
    expect(screen.getByText('商务合作')).toBeInTheDocument();
    
    // 检查导航链接
    expect(screen.getByText('全部商品')).toBeInTheDocument();
    expect(screen.getByText('管理您的账户')).toBeInTheDocument();
    expect(screen.getByText('查找门店')).toBeInTheDocument();
    expect(screen.getByText('公司简介')).toBeInTheDocument();
    expect(screen.getByText('商务购买')).toBeInTheDocument();
    
    // 检查版权信息
    expect(screen.getByText(/Copyright © 2025 购物系统/)).toBeInTheDocument();
    
    // 检查底部链接
    expect(screen.getByText('隐私政策')).toBeInTheDocument();
    expect(screen.getByText('使用条款')).toBeInTheDocument();
    expect(screen.getByText('销售政策')).toBeInTheDocument();
    expect(screen.getByText('法律信息')).toBeInTheDocument();
    expect(screen.getByText('网站地图')).toBeInTheDocument();
  });

  it('应该包含所有导航链接', () => {
    render(<Footer />);
    
    // 检查商品与服务链接
    const productLinks = [
      '全部商品',
      '电子产品',
      '服装',
      '家居厨房',
      '图书',
      '配件',
      '礼品卡'
    ];
    
    productLinks.forEach(link => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
    
    // 检查账户链接
    const accountLinks = [
      '管理您的账户',
      '会员账户',
      '我的订单',
      '我的收藏'
    ];
    
    accountLinks.forEach(link => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it('应该正确渲染链接的 href 属性', () => {
    render(<Footer />);
    
    // 检查一些关键链接的 href
    expect(screen.getByText('全部商品').closest('a')).toHaveAttribute('href', '/products');
    expect(screen.getByText('隐私政策').closest('a')).toHaveAttribute('href', '/privacy');
    expect(screen.getByText('使用条款').closest('a')).toHaveAttribute('href', '/terms');
  });
}); 