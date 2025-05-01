import Link from 'next/link';

const StoreHeadline = () => (
  <>
    <section className="py-16 px-4">
      <div className="container max-w-[1040px] mx-auto flex flex-col md:flex-row md:justify-between md:items-end">
        <div className="max-w-[600px]">
          <h2 className="text-5xl font-semibold text-gray-800">购物系统.</h2>
          <p className="text-4xl font-semibold text-gray-500 mt-2">
            以最好的方式购买您喜爱的产品。
          </p>
        </div>
      </div>
    </section>
  </>
);

export default StoreHeadline;
