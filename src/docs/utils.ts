export function sharedKeys(...objects: Record<string, any>[]): string[] {
  if (objects.length === 0) return [];

  // Start with keys of the first object
  let common = new Set(Object.keys(objects[0]));

  // Intersect with keys of each subsequent object
  for (let i = 1; i < objects.length; i++) {
    const keys = new Set(Object.keys(objects[i]));
    common = new Set([...common].filter(k => keys.has(k)));
  }

  return [...common];
}