import assert from 'node:assert/strict';
import test from 'node:test';
import { nutritionMenus } from '../src/data/nutrition-menus';
import { isNutritionPlan, parseNutritionDays } from '../src/lib/nutrition';

test('nutrition edits retain the seven ordered days and normalize meal text', () => {
    const days = nutritionMenus.keto.days.map((day) => ({ ...day }));
    days[0].breakfast = '  Novi doručak  ';
    assert.equal(parseNutritionDays(days)?.[0].breakfast, 'Novi doručak');
    assert.equal(parseNutritionDays(days)?.length, 7);
});

test('nutrition edits reject malformed days and oversized meal text', () => {
    const days = nutritionMenus.keto.days.map((day) => ({ ...day }));
    assert.equal(parseNutritionDays(days.slice(0, 6)), null);
    days[0].day = 'Nevažeći dan';
    assert.equal(parseNutritionDays(days), null);
    days[0].day = 'Ponedjeljak';
    days[0].lunch = 'x'.repeat(1001);
    assert.equal(parseNutritionDays(days), null);
    assert.equal(isNutritionPlan('keto'), true);
    assert.equal(isNutritionPlan('carnivore'), true);
    assert.equal(isNutritionPlan('other'), false);
});
