<template>
  <div class="example-container">
    <h1>v-auto-color 示例</h1>
    
    <!-- 使用默认配置的颜色集 -->
    <div class="color-set">
      <h2>默认配置颜色集</h2>
      <div 
        v-for="text in texts" 
        :key="text"
        class="color-item"
        :style="`--color: ${colorSet1.getColor(text)}`"
      >
        {{ text }}
      </div>
    </div>

    <!-- 使用自定义配置的颜色集 -->
    <div class="color-set">
      <h2>自定义配置颜色集</h2>
      <div 
        v-for="text in texts" 
        :key="text"
        class="color-item"
        :style="`--color: ${colorSet2.getColor(text)}`"
      >
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAutoColor } from 'v-auto-color';

// 默认配置的颜色集
const colorSet1 = useAutoColor('set1');

// 自定义配置的颜色集
const colorSet2 = useAutoColor({
  category: 'set2',
  hue: [180, 360], // 蓝色调范围
  saturation: [60, 90],
  lightness: [40, 70]
});

// 测试文本
const texts = [
  'Hello World',
  'Test Text',
  'Another Example',
  'Similar Text',
  'Different Content'
];
</script>

<style scoped>
.example-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.color-set {
  margin-bottom: 30px;
}

.color-item {
  display: inline-block;
  padding: 10px 20px;
  margin: 5px;
  background-color: var(--color);
  color: white;
  border-radius: 4px;
  font-weight: bold;
}
</style>
