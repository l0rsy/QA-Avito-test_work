import { test } from '@playwright/test';
import { HomePage } from '../../pages/homePage/homePage';

test.describe("Фильтр диапазона цен", () => {
    test("TC-DESK-02: Проверка min > max", async ({ page }) => {
        /**
         * Тест проверяет, что фильтр "Диапазон цен" работает корректно:
         * Ввод бОльшего числа в поле "От" не "ломает" работу сайта
         */
        
        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        await homePage.setPriceRange('2000', '1000');
        
        // Assert
        await homePage.assertEmptyStateIsVisible();
        // !!! НУЖНО УТОЧНЕНИЕ ПО ТЗ !!! 
        await homePage.assertPriceInputsAreHighlightedAsInvalid();

    });
});