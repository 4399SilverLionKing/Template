import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('@/components/Scene'), {
  loading: () => <p>Loading 3D scene...</p>,
});

export default function Home() {
  return (
    <main className="relative h-screen w-screen">
      {/* 3D 场景作为背景 */}
      <div className="absolute top-0 left-0 h-full w-full">
        <Scene />
      </div>
      {/* HTML UI 叠加在上面 */}
      <div className="absolute top-10 left-10 text-white">
        <h1 className="text-4xl font-bold">My 3D Website</h1>
        <p>Powered by Next.js and Three.js</p>
      </div>
    </main>
  );
}
