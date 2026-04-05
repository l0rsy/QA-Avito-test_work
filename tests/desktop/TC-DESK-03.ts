import { test } from "@playwright/test";
import { HomePage } from "../../pages/homePage/homePage";

test.describe("Фильтр диапазона цен", () => {
    test("TC-DESK-03: Проверка ввода букв", async ({ page }) => {
        /**
         * Тест проверяет, что фильтр "Диапазон цен" работает корректно:
         * Ввод букв в поля не должен работать
         */
        
        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        await homePage.setPriceRange("abc", "");
        
        // Assert
        await homePage.assertPriceFromInputIsEmpty();
    });
});
