import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homePage/homePage';

test.describe("Комбинированный тест", () => {
    test("TC-DESK-10: Проверка работы категории и диапазона цены", async ({ page }) => {
        /**
         * Тест проверяет, что поиск по категории и цене одновременно работает корректно:
         * При выборе определенной категории и диапазона цен все объявления удовлетворяют обоим фильтрам
         */
        
        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        
        const categories = await homePage.getAllCategories();
        const selectedCategory = categories[0];
        
        const priceFrom = '1000';
        const priceTo = '50000';
        
        await homePage.selectCategory(selectedCategory.value);
        await homePage.setPriceRange(priceFrom, priceTo);
        
        // Assert
        await homePage.assertAllItemsMatchCategory(selectedCategory.name);
        await homePage.assertAllPricesAreInRange(priceFrom, priceTo);

    });
});