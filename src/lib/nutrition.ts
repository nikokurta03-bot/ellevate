import { MealDay, nutritionMenus } from '../data/nutrition-menus';

export type NutritionPlan = keyof typeof nutritionMenus;

export function isNutritionPlan(value: unknown): value is NutritionPlan {
    return value === 'keto' || value === 'carnivore';
}

export function parseNutritionDays(value: unknown): MealDay[] | null {
    if (!Array.isArray(value) || value.length !== nutritionMenus.keto.days.length) return null;

    const days: MealDay[] = [];
    for (let index = 0; index < value.length; index++) {
        const item = value[index];
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
        if (item.day !== nutritionMenus.keto.days[index].day) return null;
        for (const meal of ['breakfast', 'lunch', 'dinner'] as const) {
            if (typeof item[meal] !== 'string' || item[meal].length > 1000) return null;
        }
        days.push({
            day: item.day,
            breakfast: item.breakfast.trim(),
            lunch: item.lunch.trim(),
            dinner: item.dinner.trim(),
        });
    }
    return days;
}
