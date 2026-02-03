# Vue-AutoColor

[English](README_EN.md) | [中文](README.md)

A node module compatible with vite/typescript/vue environment, used to implement text-based automatic color generation during vite compilation. Similar text will return similar colors, thus achieving visual consistency.

## Features

- **Text-based color generation**: Calculate colors based on plain text, similar text returns similar colors
- **Compile-time optimization**: Precompute used colors during vite compilation to reduce runtime load
- **Runtime fallback**: For non-precomputed colors, automatically generate and cache at runtime
- **Support for custom configuration**: Can configure color hue range, saturation range, and lightness range
- **TypeScript support**: Complete type definitions for a good development experience
- **Vue compatible**: Can be easily used in Vue components

## Installation

```bash
npm install v-auto-color
# or
yarn add v-auto-color
# or
pnpm add v-auto-color
```

## Usage

### 1. Configure the plugin in vite.config.ts

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteAutoColorPlugin } from 'v-auto-color';

export default defineConfig({
  plugins: [
    vue(),
    viteAutoColorPlugin() // Enable v-auto-color plugin
  ],
});
```

### 2. Use in code

```typescript
import { useAutoColor } from 'v-auto-color';

// Default configuration
const colorSet1 = useAutoColor('set1');
const color1 = colorSet1.getColor('text');

// Custom configuration
const colorSet2 = useAutoColor({
  category: 'set2',
  hue: [180, 360], // Blue tone range
  saturation: [60, 90],
  lightness: [40, 70]
});
const color2 = colorSet2.getColor('text');
```

### 3. Use in Vue components

```vue
<template>
  <div :style="`--color: ${colorSet1.getColor('text')}`">text</div>
</template>

<script setup lang="ts">
import { useAutoColor } from 'v-auto-color';

const colorSet1 = useAutoColor('set1');
</script>
```

## Configuration Options

### useAutoColor Configuration

```typescript
interface ColorConfig {
  category?: string;  // Color set category, default 'default'
  hue?: [number, number];  // Hue range, default [0, 360]
  saturation?: [number, number];  // Saturation range, default [70, 100]
  lightness?: [number, number];  // Lightness range, default [40, 60]
  algorithm?: 'hash' | 'levenshtein' | 'cosine' | 'jaccard';  // Algorithm type, default 'hash'
  similarityThreshold?: number;  // Similarity threshold, default 0.7
}

// Two usage methods
const colorSet1 = useAutoColor('category'); // Use string as category
const colorSet2 = useAutoColor({ /* complete configuration */ }); // Use object configuration
```

### Algorithm Description

| Algorithm | Description | Use Case |
|-----------|-------------|----------|
| `hash` | Generate color based on text hash value, same text returns same color | Fast generation, suitable for exact text matching scenarios |
| `levenshtein` | Calculate similarity based on edit distance, similar text returns similar color | Suitable for text with similar spelling, such as "hello" and "hello world" |
| `cosine` | Calculate similarity based on character frequency cosine similarity, similar text returns similar color | Suitable for text with different lengths but similar character distribution |
| `jaccard` | Calculate similarity based on character set Jaccard similarity, similar text returns similar color | Suitable for text with similar character composition |

### Algorithm Configuration Example

```typescript
import { useAutoColor } from 'v-auto-color';

// Use Levenshtein algorithm (edit distance)
const colorSet1 = useAutoColor({
  category: 'set1',
  algorithm: 'levenshtein',
  similarityThreshold: 0.6 // Lower similarity threshold to consider more text as similar
});

// Use cosine similarity algorithm
const colorSet2 = useAutoColor({
  category: 'set2',
  algorithm: 'cosine',
  hue: [0, 180] // Limit hue range to red to cyan
});

// Use Jaccard similarity algorithm
const colorSet3 = useAutoColor({
  category: 'set3',
  algorithm: 'jaccard',
  saturation: [80, 100], // Increase saturation to make colors more vivid
  lightness: [50, 70] // Increase lightness to make colors brighter
});

// Get colors
const color1 = colorSet1.getColor('hello');
const color2 = colorSet1.getColor('hello world'); // Similar to 'hello', returns similar color
const color3 = colorSet1.getColor('test'); // Not similar to 'hello', returns different color
```

## Performance Optimization

### Compile-time Precomputation

The plugin analyzes code during vite compilation, extracts all `useAutoColor` and `getColor` calls, precomputes all used colors, and injects them directly into the code. This way, during runtime, most colors can be directly obtained from the cache without recalculation.

### Runtime Caching

For colors not precomputed during compilation (such as dynamically generated text), the plugin will generate colors at runtime and cache them to avoid repeated calculations.

### Hash Algorithm Optimization

Using MurmurHash3 algorithm to calculate text hash values, which has the following characteristics:
- Fast calculation speed
- Uniform distribution
- Low collision rate

## Working Principle

1. **Text hashing**: Use MurmurHash3 algorithm to compute text hash values
2. **Color generation**: Calculate HSL colors based on hash values, ensuring similar text returns similar colors
3. **Compile-time analysis**: Analyze code during vite compilation to extract color usage
4. **Precompute colors**: Precompute colors for extracted text
5. **Runtime use**: Use precomputed colors at runtime, dynamically generate for non-precomputed ones

## Examples

### Basic Example

```typescript
import { useAutoColor } from 'v-auto-color';

const colorSet = useAutoColor('default');

// Similar text will return similar colors
const color1 = colorSet.getColor('hello');
const color2 = colorSet.getColor('hello world');
const color3 = colorSet.getColor('hello there');

console.log(color1); // For example: hsl(120, 80%, 50%)
console.log(color2); // For example: hsl(125, 75%, 45%)
console.log(color3); // For example: hsl(115, 85%, 55%)
```

### Vue Component Example

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

## Common Issues

### Color Inconsistency

If you find that similar text returns significantly different colors, it may be because:
- The text difference is too large, resulting in a large hash value difference
- The hue range is set too small, resulting in insignificant color changes

You can try adjusting the `hue` configuration option to expand the hue range.

### Performance Issues

For scenarios with a large amount of dynamic text, it is recommended:
- Determine text content at compile time as much as possible, so that the plugin can precompute colors
- For dynamically generated text, consider caching results to avoid repeated calls to `getColor`

### Color Quality

If the generated colors are of poor quality, you can adjust the configuration options:
- `saturation`: Adjust the saturation of colors, higher values make colors more vivid
- `lightness`: Adjust the lightness of colors, moderate values work best

## Browser Compatibility

This plugin generates standard HSL color values, which are supported by all modern browsers. For older browsers like IE11, you may need to use HEX color value polyfills.

## License

MIT License

## Contribution

Welcome to submit Issues and Pull Requests!
