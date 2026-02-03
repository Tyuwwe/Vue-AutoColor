import { Plugin } from 'vite';
import { createFilter } from '@rollup/pluginutils';
import { getTextHash } from './core/hash';
import { ColorGenerator } from './core/color';

// Vite plugin for precomputing colors at build time
export function viteAutoColorPlugin(): Plugin {
  const filter = createFilter(['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue']);
  
  // Collected color usage data
  const colorUsage: Record<string, Record<string, string>> = {};

  return {
    name: 'v-auto-color',

    // Analyze code during build
    transform(code, id) {
      if (!filter(id)) return null;

      // Extract useAutoColor calls and getColor calls
      const useAutoColorRegex = /useAutoColor\s*\(\s*(?:(['"])([^'"]+)\1|\{[^}]*\})\s*\)/g;
      const getColorRegex = /\.getColor\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

      let match;
      const colorSets = new Set<string>();

      // Extract color set configurations
      while ((match = useAutoColorRegex.exec(code)) !== null) {
        let category = 'default';
        if (match[2]) {
          // String configuration
          category = match[2];
        } else {
          // Object configuration - extract category
          const configMatch = match[0].match(/category\s*:\s*['"]([^'"]+)['"]/);
          if (configMatch) {
            category = configMatch[1];
          }
        }
        colorSets.add(category);
      }

      // Extract text parameters from getColor calls
      const texts = new Set<string>();
      while ((match = getColorRegex.exec(code)) !== null) {
        texts.add(match[1]);
      }

      // Precompute colors for extracted texts
      colorSets.forEach(category => {
        if (!colorUsage[category]) {
          colorUsage[category] = {};
        }

        texts.forEach(text => {
          const generator = new ColorGenerator({ category });
          const color = generator.getColor(text, getTextHash);
          colorUsage[category][text] = color;
        });
      });

      return null;
    },

    // Generate precomputed colors module
    generateBundle() {
      // Create precomputed colors code
      const precomputedCode = `
        import { __internal__setPrecomputedColors } from 'v-auto-color';
        __internal__setPrecomputedColors(${JSON.stringify(colorUsage, null, 2)});
      `;

      // Add precomputed colors module to bundle
      this.emitFile({
        type: 'asset',
        fileName: 'v-auto-color-precomputed.js',
        source: precomputedCode
      });

      // Ensure the precomputed module is loaded before application code
      this.emitFile({
        type: 'asset',
        fileName: 'v-auto-color-initializer.js',
        source: `import "/v-auto-color-precomputed.js";`
      });
    }
  };
}

// Export plugin
export default viteAutoColorPlugin;
