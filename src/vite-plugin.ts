import { Plugin } from 'vite';
import { getTextHash } from './core/hash';
import { ColorGenerator } from './core/color';

// Simple file filter implementation (replaces @rollup/pluginutils createFilter)
function createFilter(include: string[], exclude?: string[]) {
  return function(id: string) {
    // Check if id matches any include pattern
    const included = include.some(pattern => {
      if (pattern === '**/*') return true;
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(id);
    });

    // Check if id matches any exclude pattern
    const excluded = exclude && exclude.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(id);
    });

    return included && !excluded;
  };
}

// Vite plugin for precomputing colors at build time
export function viteAutoColorPlugin(): Plugin {
  const filter = createFilter(['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue']);

  return {
    name: 'v-auto-color',

    // Analyze code during build and inject precomputed colors
    transform(code, id) {
      if (!filter(id)) return null;

      // Check if this file imports useAutoColor
      if (!code.includes('useAutoColor')) return null;

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
      const colorUsage: Record<string, Record<string, string>> = {};
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

      // Inject precomputed colors into the code
      if (Object.keys(colorUsage).length > 0) {
        const precomputedCode = `
          // Precomputed colors for v-auto-color
          import { __internal__setPrecomputedColors } from 'v-auto-color';
          __internal__setPrecomputedColors(${JSON.stringify(colorUsage, null, 2)});
        `;

        // Add the precomputed code at the top of the file
        code = precomputedCode + '\n' + code;
      }

      return code;
    }
  };
}

// Export plugin
export default viteAutoColorPlugin;
