'use client';

import { useTranslation } from 'react-i18next';

const StoreHeadline = () => {
  const { t } = useTranslation();
  return (
    <section className="px-6 py-[80px]">
      <div className="mx-auto max-w-[1040px]">
        <div className="text-center">
          <p className="text-xl md:text-2xl font-normal text-[#1d1d1f]/90 leading-relaxed">
            {t('common.all_products_description')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default StoreHeadline;
