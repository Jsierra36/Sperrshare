import type { Category } from './types';

// From docs/data-model.md — fixed list, easy to extend, max 20.
// `name` is the display label — German, since that's the app's language (docs/normas.md).
// `id` stays a stable English slug (internal key, not shown to users).
export const categories: Category[] = [
  { id: 'furniture', name: 'Möbel', icon: '🛋️', color: '#2D5A27' },
  { id: 'electronics', name: 'Elektronik', icon: '🔌', color: '#1565C0' },
  { id: 'appliances', name: 'Elektrogeräte', icon: '🧺', color: '#6A1B9A' },
  { id: 'clothing', name: 'Kleidung & Textilien', icon: '👕', color: '#AD1457' },
  { id: 'books_toys', name: 'Bücher & Spielzeug', icon: '📚', color: '#EF6C00' },
  { id: 'sports', name: 'Sport & Freizeit', icon: '🏀', color: '#00838F' },
  { id: 'household', name: 'Haushaltswaren', icon: '🍽️', color: '#795548' },
  { id: 'other', name: 'Sonstiges', icon: '📦', color: '#546E7A' },
];

export function getCategory(id: string): Category {
  return categories.find((c) => c.id === id) ?? categories[categories.length - 1];
}

export function getCategories(ids: string[]): Category[] {
  return ids.map(getCategory);
}

// Used for map pins and single-color accents where a post has several categories.
export function getPrimaryCategory(ids: string[]): Category {
  return getCategory(ids[0]);
}
