import { getTextHash } from './core/hash';
import { ColorConfig, ColorGenerator } from './core/color';

// Precomputed colors cache (filled by Vite plugin at build time)
const precomputedColors: Record<string, Record<string, string>> = {};

// ColorSet class for managing color generation
export class ColorSet {
  private config: ColorConfig;
  private generator: ColorGenerator;
  private category: string;

  constructor(config: ColorConfig | string = 'default') {
    if (typeof config === 'string') {
      this.config = { category: config };
    } else {
      this.config = config;
    }

    this.category = this.config.category || 'default';
    this.generator = new ColorGenerator(this.config);
  }

  // Get color for text
  getColor(text: string): string {
    // Check if color is precomputed
    if (precomputedColors[this.category] && precomputedColors[this.category][text]) {
      return precomputedColors[this.category][text];
    }

    // Generate color at runtime if not precomputed
    const color = this.generator.getColor(text, getTextHash);
    
    // Cache the generated color for future use
    if (!precomputedColors[this.category]) {
      precomputedColors[this.category] = {};
    }
    precomputedColors[this.category][text] = color;

    return color;
  }
}

// Main function to create ColorSet instances
export function useAutoColor(config: ColorConfig | string = 'default'): ColorSet {
  return new ColorSet(config);
}

// Expose precomputed colors for Vite plugin to fill
export function __internal__setPrecomputedColors(colors: Record<string, Record<string, string>>): void {
  Object.assign(precomputedColors, colors);
}

// Export types
export type { ColorConfig };
