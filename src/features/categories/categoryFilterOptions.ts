/** dressfair.com PLP inline color swatches (shown in filter row). */
export const CATEGORY_INLINE_COLOR_OPTIONS = [
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Black',
  'White',
] as const;

export const CATEGORY_SIZE_OPTIONS = ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'] as const;

export type CategorySizeOption = (typeof CATEGORY_SIZE_OPTIONS)[number];

/** Extended palette for the full Filters drawer. */
export const CATEGORY_COLOR_OPTIONS = [
  ...CATEGORY_INLINE_COLOR_OPTIONS,
  'Brown',
  'Beige',
  'Pink',
  'Grey',
  'Purple',
  'Orange',
  'Navy',
] as const;

export type CategoryColorOption = (typeof CATEGORY_COLOR_OPTIONS)[number];

export const COLOR_SWATCH_HEX: Record<string, string> = {
  Red: '#E53935',
  Blue: '#1E88E5',
  Green: '#43A047',
  Yellow: '#FDD835',
  Black: '#111111',
  White: '#FFFFFF',
  Brown: '#795548',
  Beige: '#D7CCC8',
  Pink: '#EC407A',
  Grey: '#9E9E9E',
  Purple: '#8E24AA',
  Orange: '#FB8C00',
  Navy: '#1A237E',
};

export function colorSwatchHex(name: string): string {
  return COLOR_SWATCH_HEX[name] ?? '#CCCCCC';
}
