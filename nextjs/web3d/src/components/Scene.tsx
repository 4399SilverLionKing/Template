'use client';

import React from 'react';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import GLBModel from './GLBModel';

export default function Scene() {
  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

        {/* 加载GLB模型 */}
        <GLBModel
          modelPath="/modals/scene.glb"
          scale={1}
          position={[0, 0, 0]}
          autoRotate={false}
          rotationSpeed={0.5}
        />

        {/* 轨道控制器：允许用户旋转、缩放和平移相机 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
