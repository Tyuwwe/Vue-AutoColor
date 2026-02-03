// Color generation based on hash values
export type AlgorithmType = 'hash' | 'levenshtein' | 'cosine' | 'jaccard';

export interface ColorConfig {
  category?: string;
  hue?: [number, number];
  saturation?: [number, number];
  lightness?: [number, number];
  algorithm?: AlgorithmType;
  similarityThreshold?: number; // 相似度阈值，用于相似度算法
}

export class ColorGenerator {
  private config: Required<ColorConfig>;

  constructor(config: ColorConfig = {}) {
    this.config = {
      category: config.category || 'default',
      hue: config.hue || [0, 360],
      saturation: config.saturation || [70, 100],
      lightness: config.lightness || [40, 60],
      algorithm: config.algorithm || 'hash',
      similarityThreshold: config.similarityThreshold || 0.7
    };
  }

  // Generate color from hash value
  generateColor(hash: number): string {
    const { hue, saturation, lightness } = this.config;

    // Calculate hue based on hash
    const hueRange = hue[1] - hue[0];
    const calculatedHue = hue[0] + (hash % hueRange);

    // Calculate saturation based on hash
    const satRange = saturation[1] - saturation[0];
    const calculatedSat = saturation[0] + ((hash >> 8) % satRange);

    // Calculate lightness based on hash
    const lightRange = lightness[1] - lightness[0];
    const calculatedLight = lightness[0] + ((hash >> 16) % lightRange);

    // Return HSL color string
    return `hsl(${calculatedHue}, ${calculatedSat}%, ${calculatedLight}%)`;
  }

  // Get color for text (wrapper method)
  getColor(text: string, hashFn: (text: string) => number): string {
    const hash = hashFn(text);
    return this.generateColor(hash);
  }
}
