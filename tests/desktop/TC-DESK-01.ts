import { test } from '@playwright/test';
import { HomePage } from '../../pages/homePage/homePage';

test.describe("Фильтр диапазона цен", () => {
    test("TC-DESK-01: Проверка фильтрации по диапазону цен", async ({ page }) => {
        /**
         * Тест проверяет, что фильтр "Диапазон цен" работает корректно:
         * Все цены находятся в нужном диапазоне
         */
        
        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();

        // Получаем X - цену первого объявления
        const Xprice = await homePage.getFirstItemPrice();
        await homePage.setPriceRange((Xprice - Xprice*0.1).toString(), (Xprice + Xprice*0.1).toString());
        
        // Assert
        await homePage.assertAllPricesAreInRangeFromFirstItem();

    });
});