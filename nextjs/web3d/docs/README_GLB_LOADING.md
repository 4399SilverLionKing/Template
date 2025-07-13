# GLB模型加载指南

本项目提供了一个完整的GLB模型加载解决方案，基于React Three Fiber和@react-three/drei。

## 文件结构

```
src/
├── components/
│   ├── GLBModel.tsx     # 可复用的GLB模型组件
│   └── Scene.tsx        # 主3D场景组件
public/
└── modals/
    └── scene.glb        # 你的GLB模型文件
```

## 基本使用

### 1. 简单加载GLB模型

```tsx
import GLBModel from '@/components/GLBModel';

function MyScene() {
  return (
    <Canvas>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} />
      
      <GLBModel 
        modelPath="/modals/scene.glb"
        scale={1}
        position={[0, 0, 0]}
      />
      
      <OrbitControls />
    </Canvas>
  );
}
```

### 2. 带动画的模型

```tsx
<GLBModel 
  modelPath="/modals/scene.glb"
  scale={2}
  position={[0, -1, 0]}
  autoRotate={true}
  rotationSpeed={0.3}
/>
```

## GLBModel组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `modelPath` | `string` | 必需 | GLB文件的路径（相对于public目录） |
| `scale` | `number` | `1` | 模型缩放比例 |
| `position` | `[number, number, number]` | `[0, 0, 0]` | 模型位置 [x, y, z] |
| `rotation` | `[number, number, number]` | `[0, 0, 0]` | 模型旋转 [x, y, z] |
| `autoRotate` | `boolean` | `false` | 是否自动旋转 |
| `rotationSpeed` | `number` | `0.5` | 旋转速度 |

## 性能优化

### 预加载模型

```tsx
import { preloadGLBModel } from '@/components/GLBModel';

// 在组件外部预加载
preloadGLBModel('/modals/scene.glb');
```

### 使用Suspense边界

GLBModel组件内置了Suspense边界，会在模型加载时显示一个简单的线框立方体作为占位符。

## 常见问题

### 1. 模型太大或太小
调整`scale`属性：
```tsx
<GLBModel modelPath="/modals/scene.glb" scale={0.5} /> // 缩小50%
<GLBModel modelPath="/modals/scene.glb" scale={2} />   // 放大200%
```

### 2. 模型位置不对
调整`position`属性：
```tsx
<GLBModel 
  modelPath="/modals/scene.glb" 
  position={[0, -2, 0]} // 向下移动2个单位
/>
```

### 3. 模型朝向不对
调整`rotation`属性：
```tsx
<GLBModel 
  modelPath="/modals/scene.glb" 
  rotation={[0, Math.PI, 0]} // 旋转180度
/>
```

### 4. 光照效果不好
在Scene组件中调整光照：
```tsx
<ambientLight intensity={0.6} />
<pointLight position={[10, 10, 10]} intensity={1} />
<directionalLight position={[-10, -10, -5]} intensity={0.5} />
```

## 支持的文件格式

- `.glb` (推荐) - 二进制GLTF格式
- `.gltf` - JSON格式的GLTF

## 相机控制

项目中包含了OrbitControls，用户可以：
- 鼠标左键拖拽：旋转视角
- 鼠标滚轮：缩放
- 鼠标右键拖拽：平移视角

## 下一步

1. 尝试加载你自己的GLB模型
2. 调整模型的位置、大小和旋转
3. 实验不同的光照设置
4. 添加更多的3D对象到场景中
