/**
 * UI-related constants following Clean Code principles
 * Replaces magic numbers with intention-revealing names
 */

export const SPACING = {
  PAGE_TOP_MARGIN: 4,
  SECTION_MARGIN_BOTTOM: 3,
  SECTION_MARGIN_BOTTOM_SMALL: 2,
  SECTION_MARGIN_BOTTOM_LARGE: 4,
  BUTTON_GAP: 1,
  ITEM_GAP: 2,
  PADDING_STANDARD: 3,
} as const;

export const PROGRESS_BAR = {
  HEIGHT_SMALL: 6,
  HEIGHT_MEDIUM: 8,
  HEIGHT_LARGE: 12,
  BORDER_RADIUS: 1,
  MAX_PERCENTAGE: 100,
} as const;

export const CHART = {
  FONT_SIZE: 12,
  HEIGHT: 300,
  GRADIENT_START_OPACITY: 0.3,
  GRADIENT_END_OPACITY: 0,
  DOMAIN_MULTIPLIER: 1.1,
} as const;

export const TOOLTIP = {
  BORDER_RADIUS: 8,
  FONT_SIZE_SMALL: 12,
} as const;

export const ICON_SIZE = {
  SMALL: 28,
  MEDIUM: 'medium' as const,
  LARGE: 'large' as const,
} as const;

export const STROKE_WIDTH = {
  THIN: 2,
  MEDIUM: 3,
  THICK: 5,
} as const;
