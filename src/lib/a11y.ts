/**
 * a11y.ts — Accessibility utilities for screen readers and keyboard navigation.
 */

/** Announce a message to screen readers using an aria-live region */
export function announceToScreenReader(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
  const existingRegion = document.getElementById('kshan-a11y-live-region');
  const region = existingRegion ?? document.createElement('div');

  if (!existingRegion) {
    region.id = 'kshan-a11y-live-region';
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
  } else {
    region.setAttribute('aria-live', politeness);
  }

  // Clear and update to trigger announcement in virtual screen readers
  region.textContent = '';
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}

/** Check if reduced motion is requested by user */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
