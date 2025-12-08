import { streamMethods} from './streams';
import { patternMethods } from './patterns';
import { instruments } from './instruments';
import { effects } from './effects';

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

export function search(query: string): Record<string, Record<string, any>> {
    if (query.trim() === '') return {};
    const searchable: Record<string, any> = {
        stream: streamMethods,
        pattern: patternMethods,
        ...instruments,
        ...effects,
    };
    return Object.entries(searchable)
        .reduce((acc, [section, items]) => {
            const results = Object.entries(items)
                .filter(([name]) => name.toLowerCase().includes(query))
                .reduce((obj, [name, info]) => ({
                    ...obj,
                    [name]: info,
                }), {} as Record<string, any>);
            Object.keys(results).length > 0 && (acc[section] = results);
            return acc;
        }, {} as Record<string, Record<string, any>>);
}