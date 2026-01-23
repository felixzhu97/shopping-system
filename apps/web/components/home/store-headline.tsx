'use client';

import { useTranslation } from 'react-i18next';

const StoreHeadline = () => {
  const { t } = useTranslation();
  return (
    <section className="py-[80px] px-6 bg-[#f5f5f7]">
      <div className="container max-w-[1040px] mx-auto">
        <div className="text-center">
          <p className="text-[24px] font-normal text-[#1d1d1f]/90">
            {t('common.all_products_description')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default StoreHeadline;
