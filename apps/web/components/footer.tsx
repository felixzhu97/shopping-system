'use client';

import Link from 'next/link';
import { LanguageSwitcher } from './language-switcher';
import { useTranslation } from 'react-i18next';

// 扩展导航区域组件
function ExtendedNavigation() {
  const { t } = useTranslation();

  const navItems = [
    {
      title: t('common.products_and_services'),
      links: [
        { name: t('common.all_products'), href: '/products' },
        { name: t('common.electronics'), href: '/products?category=electronics' },
        { name: t('common.clothing'), href: '/products?category=clothing' },
        { name: t('common.home_kitchen'), href: '/products?category=home-kitchen' },
        { name: t('common.books'), href: '/products?category=books' },
        { name: t('common.accessories'), href: '/products?category=accessories' },
        { name: t('common.gift_cards'), href: '/gift-cards' },
      ],
    },
    {
      title: t('common.account'),
      links: [
        { name: t('common.manage_your_account'), href: '/account' },
        { name: t('common.membership_account'), href: '/account/membership' },
        { name: t('common.my_orders'), href: '/orders' },
        { name: t('common.my_favorites'), href: '/account/saved' },
      ],
    },
    {
      title: t('common.shopping_guide'),
      links: [
        { name: t('common.find_stores'), href: '/stores' },
        { name: t('common.today_promotions'), href: '/promotions' },
        { name: t('common.shopping_help'), href: '/help' },
        { name: t('common.shipping_policy'), href: '/shipping' },
        { name: t('common.return_policy'), href: '/returns' },
        { name: t('common.payment_methods'), href: '/payment' },
      ],
    },
    {
      title: t('common.about_us'),
      links: [
        { name: t('common.company_profile'), href: '/about' },
        { name: t('common.news_center'), href: '/news' },
        { name: t('common.recruitment'), href: '/careers' },
        { name: t('common.corporate_responsibility'), href: '/responsibility' },
        { name: t('common.contact_us'), href: '/contact' },
      ],
    },
    {
      title: t('common.business_cooperation'),
      links: [
        { name: t('common.business_purchase'), href: '/business' },
        { name: t('common.education_discount'), href: '/education' },
        { name: t('common.supplier_cooperation'), href: '/suppliers' },
        { name: t('common.advertising_service'), href: '/advertising' },
      ],
    },
  ];

  return (
    <div className="py-12 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {navItems.map(category => (
            <div key={category.title}>
              <h3 className="font-semibold text-sm text-gray-900 mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.links.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="text-gray-600 bg-[#f5f5f7]">
      {/* Extended Navigation */}
      <ExtendedNavigation />
      <div className="container mx-auto px-4">
        <div className="border-t border-gray-200 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-gray-500">
            {/* left: copyright */}
            <p>{t('common.copyright')}</p>

            {/* middle: policy links */}
            <div className="flex flex-wrap gap-x-6">
              <Link href="/privacy" className="hover:underline">
                {t('common.privacy_policy')}
              </Link>
              <Link href="/terms" className="hover:underline">
                {t('common.terms_of_service')}
              </Link>
              <Link href="/sales" className="hover:underline">
                {t('common.sales_policy')}
              </Link>
              <Link href="/legal" className="hover:underline">
                {t('common.legal_information')}
              </Link>
              <Link href="/sitemap" className="hover:underline">
                {t('common.sitemap')}
              </Link>
            </div>

            {/* right: language switcher */}
            <div className="flex items-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
