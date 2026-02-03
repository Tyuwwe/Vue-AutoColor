# Vue-AutoColor

一个兼容 vite/typescript/vue 环境的 node module，用于在 vite 编译时实现基于文本的自动颜色生成。相似的文本会返回相似的颜色，从而实现视觉上的一致性。

## 功能特点

- **基于文本的颜色生成**：根据纯文本计算颜色，相似的文本返回相似的颜色
- **编译时优化**：在 vite 编译时预先计算已使用的颜色，降低运行时负载
- **运行时 fallback**：对于未预编译的颜色，在运行时自动生成并缓存
- **支持自定义配置**：可以配置颜色的色相范围、饱和度范围和亮度范围
- **TypeScript 支持**：完整的类型定义，提供良好的开发体验
- **Vue 兼容**：可以在 Vue 组件中轻松使用

## 安装

```bash
npm install v-auto-color
# 或
yarn add v-auto-color
# 或
pnpm add v-auto-color
```

## 使用方法

### 1. 在 vite.config.ts 中配置插件

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteAutoColorPlugin } from 'v-auto-color';

export default defineConfig({
  plugins: [
    vue(),
    viteAutoColorPlugin() // 启用 v-auto-color 插件
  ],
});
```

### 2. 在代码中使用

```typescript
import { useAutoColor } from 'v-auto-color';

// 使用默认配置
const colorSet1 = useAutoColor('set1');
const color1 = colorSet1.getColor('text');

// 使用自定义配置
const colorSet2 = useAutoColor({
  category: 'set2',
  hue: [180, 360], // 蓝色调范围
  saturation: [60, 90],
  lightness: [40, 70]
});
const color2 = colorSet2.getColor('text');
```

### 3. 在 Vue 组件中使用

```vue
<template>
  <div :style="`--color: ${colorSet1.getColor('text')}`">text</div>
</template>

<script setup lang="ts">
import { useAutoColor } from 'v-auto-color';

const colorSet1 = useAutoColor('set1');
</script>
```

## 配置选项

### useAutoColor 配置

```typescript
interface ColorConfig {
  category?: string;  // 颜色集类别，默认 'default'
  hue?: [number, number];  // 色相范围，默认 [0, 360]
  saturation?: [number, number];  // 饱和度范围，默认 [70, 100]
  lightness?: [number, number];  // 亮度范围，默认 [40, 60]
  algorithm?: 'hash' | 'levenshtein' | 'cosine' | 'jaccard';  // 算法类型，默认 'hash'
  similarityThreshold?: number;  // 相似度阈值，默认 0.7
}

// 两种使用方式
const colorSet1 = useAutoColor('category'); // 使用字符串作为类别
const colorSet2 = useAutoColor({ /* 完整配置 */ }); // 使用对象配置
```

### 算法说明

| 算法 | 描述 | 适用场景 |
|------|------|----------|
| `hash` | 基于文本哈希值生成颜色，相同文本返回相同颜色 | 快速生成，适用于文本完全匹配的场景 |
| `levenshtein` | 基于编辑距离计算相似度，相似文本返回相似颜色 | 适用于拼写相似的文本，如 "hello" 和 "hello world" |
| `cosine` | 基于字符频率的余弦相似度，相似文本返回相似颜色 | 适用于长度不同但字符分布相似的文本 |
| `jaccard` | 基于字符集合的Jaccard相似度，相似文本返回相似颜色 | 适用于字符组成相似的文本 |

### 算法配置示例

```typescript
import { useAutoColor } from 'v-auto-color';

// 使用Levenshtein算法（编辑距离）
const colorSet1 = useAutoColor({
  category: 'set1',
  algorithm: 'levenshtein',
  similarityThreshold: 0.6 // 降低相似度阈值，使更多文本被认为相似
});

// 使用余弦相似度算法
const colorSet2 = useAutoColor({
  category: 'set2',
  algorithm: 'cosine',
  hue: [0, 180] // 限制色相范围为红色到青色
});

// 使用Jaccard相似度算法
const colorSet3 = useAutoColor({
  category: 'set3',
  algorithm: 'jaccard',
  saturation: [80, 100], // 提高饱和度，使颜色更鲜艳
  lightness: [50, 70] // 提高亮度，使颜色更明亮
});

// 获取颜色
const color1 = colorSet1.getColor('hello');
const color2 = colorSet1.getColor('hello world'); // 与 'hello' 相似，返回相似颜色
const color3 = colorSet1.getColor('test'); // 与 'hello' 不相似，返回不同颜色
```

## 性能优化

### 编译时预计算

插件会在 vite 编译时分析代码，提取所有 `useAutoColor` 和 `getColor` 的调用，预先计算出所有使用的颜色，并在构建时注入到代码中。这样在运行时，大部分颜色都可以直接从缓存中获取，无需重新计算。

### 运行时缓存

对于未在编译时预计算的颜色（例如动态生成的文本），插件会在运行时生成颜色并缓存起来，避免重复计算。

### 哈希算法优化

使用 MurmurHash3 算法计算文本哈希值，该算法具有以下特点：
- 计算速度快
- 分布均匀
- 碰撞率低

## 工作原理

1. **文本哈希**：使用 MurmurHash3 算法对文本进行哈希计算，得到一个数值
2. **颜色生成**：根据哈希值计算 HSL 颜色，确保相似的文本返回相似的颜色
3. **编译时分析**：在 vite 编译时分析代码，提取颜色使用情况
4. **预计算颜色**：为提取的文本预先计算颜色
5. **运行时使用**：在运行时优先使用预计算的颜色，未预计算的则动态生成

## 示例

### 基本示例

```typescript
import { useAutoColor } from 'v-auto-color';

const colorSet = useAutoColor('default');

// 相似的文本会返回相似的颜色
const color1 = colorSet.getColor('hello');
const color2 = colorSet.getColor('hello world');
const color3 = colorSet.getColor('hello there');

console.log(color1); // 例如: hsl(120, 80%, 50%)
console.log(color2); // 例如: hsl(125, 75%, 45%)
console.log(color3); // 例如: hsl(115, 85%, 55%)
```

### Vue 组件示例

```vue
<template>
  <div class="tag-container">
    <span 
      v-for="tag in tags" 
      :key="tag"
      class="tag"
      :style="`--tag-color: ${colorSet.getColor(tag)}`"
    >
      {{ tag }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useAutoColor } from 'v-auto-color';

const colorSet = useAutoColor('tags');
const tags = ['JavaScript', 'TypeScript', 'Vue', 'React', 'Node.js'];
</script>

<style scoped>
.tag {
  display: inline-block;
  padding: 4px 12px;
  margin: 4px;
  background-color: var(--tag-color);
  color: white;
  border-radius: 16px;
  font-size: 14px;
}
</style>
```

## 常见问题

### 颜色不一致

如果发现相似的文本返回的颜色差异较大，可能是因为：
- 文本差异过大，导致哈希值差异较大
- 色相范围设置过小，导致颜色变化不明显

可以尝试调整 `hue` 配置选项，扩大色相范围。

### 性能问题

对于大量动态文本的场景，建议：
- 尽可能在编译时确定文本内容，以便插件能够预计算颜色
- 对于动态生成的文本，可以考虑缓存结果，避免重复调用 `getColor`

### 颜色质量

如果生成的颜色质量不佳，可以调整配置选项：
- `saturation`：调整颜色的饱和度，值越高颜色越鲜艳
- `lightness`：调整颜色的亮度，值适中时颜色效果最好

## 浏览器兼容性

本插件生成的是标准的 HSL 颜色值，支持所有现代浏览器。对于 IE11 等旧浏览器，可能需要使用 HEX 颜色值的 polyfill。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
