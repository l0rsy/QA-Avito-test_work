import { test } from '@playwright/test';
import { HomePage } from '../../pages/homePage/homePage';

test.describe("Категории", () => {
    test("TC-DESK-06: Проверка всех категорий", async ({ page }) => {
        /**
         * Тест проверяет, что категории работает корректно:
         * При выборе определенной категории, все объявления в списке соответствуют ей
         */
        
        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        
        const categories = await homePage.getAllCategories();
        // Проходим по всем категориям
        for (const category of categories) {
            // Выбираем категорию
            await homePage.selectCategory(category.value);            
            // Assert
            await homePage.assertAllItemsMatchCategory(category.name);
        }
    });
});