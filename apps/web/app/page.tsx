export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          欢迎来到 <span className="text-blue-600">购物系统</span>
        </h1>
        <p className="mt-3 text-2xl">开始您的购物体验</p>
      </main>
    </div>
  );
}
