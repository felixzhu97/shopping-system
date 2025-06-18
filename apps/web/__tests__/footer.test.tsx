import { render, screen } from '@testing-library/react';
import { Footer } from '../components/footer';
import { describe, it, expect } from 'vitest';

describe('Footer', () => {
  it('should render footer component correctly', () => {
    render(<Footer />);

    // check navigation titles
    expect(screen.getByText('商品与服务')).toBeInTheDocument();
    expect(screen.getByText('账户')).toBeInTheDocument();
    expect(screen.getByText('购物指南')).toBeInTheDocument();
    expect(screen.getByText('关于我们')).toBeInTheDocument();
    expect(screen.getByText('商务合作')).toBeInTheDocument();

    // check navigation links
    expect(screen.getByText('全部商品')).toBeInTheDocument();
    expect(screen.getByText('管理您的账户')).toBeInTheDocument();
    expect(screen.getByText('查找门店')).toBeInTheDocument();
    expect(screen.getByText('公司简介')).toBeInTheDocument();
    expect(screen.getByText('商务购买')).toBeInTheDocument();

    // check copyright information
    expect(screen.getByText(/Copyright © 2025 Felix 版权所有/)).toBeInTheDocument();

    // check bottom links
    expect(screen.getByText('隐私政策')).toBeInTheDocument();
    expect(screen.getByText('使用条款')).toBeInTheDocument();
    expect(screen.getByText('销售政策')).toBeInTheDocument();
    expect(screen.getByText('法律信息')).toBeInTheDocument();
    expect(screen.getByText('网站地图')).toBeInTheDocument();
  });

  it('should contain all navigation links', () => {
    render(<Footer />);

    // check product and service links
    const productLinks = ['全部商品', '电子产品', '服装', '家居厨房', '图书', '配件', '礼品卡'];

    productLinks.forEach(link => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });

    // check account links
    const accountLinks = ['管理您的账户', '会员账户', '我的订单', '我的收藏'];

    accountLinks.forEach(link => {
      expect(screen.getByText(link)).toBeInTheDocument();
    });
  });

  it('should render correct href attribute in links', () => {
    render(<Footer />);

    // check some key links href
    expect(screen.getByText('全部商品').closest('a')).toHaveAttribute('href', '/products');
    expect(screen.getByText('隐私政策').closest('a')).toHaveAttribute('href', '/privacy');
    expect(screen.getByText('使用条款').closest('a')).toHaveAttribute('href', '/terms');
  });
});
