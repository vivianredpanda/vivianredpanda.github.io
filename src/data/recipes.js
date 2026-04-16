// ─── Categories ───────────────────────────────────────────────────────────────
// To add a new category: add an entry here and place the jar image in /public/kitchen/
export const CATEGORIES = [
  { id: 'drinks', label: '饮料', accent: '#b08878', jar: 'jug', heroImage: '/recipes/drinks_same.jpg' },
  { id: 'sweets', label: '甜食', accent: '#8a7288', jar: 'jar_1', heroImage: '/recipes/desserts_same.jpg' },
  { id: 'snacks', label: '点心', accent: '#7078a0', jar: 'jar_5', heroImage: '/recipes/dimsum_same.jpg' },
  { id: 'braised', label: '炖', accent: '#b08070', jar: 'jar_3', heroImage: '/recipes/boil_same.jpg' },
  { id: 'stewed', label: '熬煮', accent: '#9a7060', jar: 'jar_4', heroImage: '/recipes/boil_same.jpg' },
  { id: 'steamed', label: '蒸', accent: '#7080a8', jar: 'jar_2', heroImage: '/recipes/steamed_same.jpg' },
  { id: 'wok', label: '炒', accent: '#708870', jar: 'jar_1', heroImage: '/recipes/stir_fry_same.jpg' },
  { id: 'roasted', label: '烤', accent: '#907860', jar: 'jar_3', heroImage: '/recipes/oven_same.jpg' },
];

// ─── Recipes ──────────────────────────────────────────────────────────────────
// To add a recipe: drop a new .json file into src/data/recipes/
// Name it anything descriptive, e.g. "wok-garlic-shrimp.json"
// The file will be auto-discovered and sorted by id.
//
// Required fields: id, categoryId, name, description, difficulty, time, tags,
//                  ingredients (array of { group?, items[] }), steps (string[])
// Optional fields: makes, notes (string[]), image (path under /public/)

const modules = import.meta.glob('./recipes/*.json', { eager: true });

export const RECIPES = Object.values(modules)
  .map((mod) => mod.default ?? mod)
  .sort((a, b) => a.id - b.id);
