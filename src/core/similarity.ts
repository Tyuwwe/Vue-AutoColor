// String similarity algorithms

// Levenshtein distance algorithm (edit distance)
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate Levenshtein distance
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  // Calculate similarity score (0-1)
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : 1 - matrix[str2.length][str1.length] / maxLength;
}

// Cosine similarity algorithm
export function cosineSimilarity(str1: string, str2: string): number {
  // Create character frequency maps
  const freq1 = new Map<string, number>();
  const freq2 = new Map<string, number>();
  const allChars = new Set<string>();

  // Count frequencies for str1
  for (const char of str1) {
    freq1.set(char, (freq1.get(char) || 0) + 1);
    allChars.add(char);
  }

  // Count frequencies for str2
  for (const char of str2) {
    freq2.set(char, (freq2.get(char) || 0) + 1);
    allChars.add(char);
  }

  // Calculate dot product
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (const char of allChars) {
    const f1 = freq1.get(char) || 0;
    const f2 = freq2.get(char) || 0;
    dotProduct += f1 * f2;
    magnitude1 += f1 * f1;
    magnitude2 += f2 * f2;
  }

  // Calculate cosine similarity
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

// Jaccard similarity algorithm
export function jaccardSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1);
  const set2 = new Set(str2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// Get similarity score based on algorithm
export function getSimilarityScore(str1: string, str2: string, algorithm: 'levenshtein' | 'cosine' | 'jaccard'): number {
  switch (algorithm) {
    case 'levenshtein':
      return levenshteinDistance(str1, str2);
    case 'cosine':
      return cosineSimilarity(str1, str2);
    case 'jaccard':
      return jaccardSimilarity(str1, str2);
    default:
      return 0;
  }
}
