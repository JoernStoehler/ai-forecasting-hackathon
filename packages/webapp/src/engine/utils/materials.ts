/**
 * Utilities for processing materials text, including stripping HTML comments.
 */

/**
 * Strips HTML comments from text.
 * Used when preparing prompts to remove provenance comments that don't benefit the LLM.
 */
export function stripHtmlComments(text: string): string {
  // Remove HTML comments (<!-- ... -->)
  // Using a non-greedy match to handle multiple comments
  return text.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Strips HTML comments from multiple material bodies while preserving other properties.
 */
export function stripCommentsFromMaterials<T extends { body: string }>(materials: T[]): T[] {
  return materials.map(m => ({
    ...m,
    body: stripHtmlComments(m.body),
  }));
}
