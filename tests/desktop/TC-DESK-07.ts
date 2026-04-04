import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homePage/homePage';

test.describe("Категории", () => {
    test("TC-DESK-07: Проверка сброса категорий", async ({ page }) => {
        /**
         * Тест проверяет, что сброс категории работает корректно:
         * При сбросе категории помимо выбранной ранее категории появляются объявления из всех остальных категорий
         */
        
        // Arrange
        const homePage = new HomePage(page);
        
        // Act - 1
        await homePage.open();
        
        const categories = await homePage.getAllCategories();
        const firstCategory = categories[0];
        
        await homePage.selectCategory(firstCategory.value);

        // Assert - 1
        await homePage.assertAllItemsHaveSameCategory(firstCategory.name);

        // Act - 2
        await homePage.clickSideResetFilters();
        await homePage.waitForListUpdate(homePage['realoadListInfo']);
        
        // Assert - 2
        const selectedValue = await homePage['categorySelect'].inputValue();
        expect(selectedValue, 'Фильтр категории должен быть сброшен на "Все категории"').toBe('');
        
        await homePage.assertItemsHaveMultipleCategories();

    });
});