import { test } from "@playwright/test";
import { HomePage } from "../../pages/homePage/homePage";

test.describe("Сортировка по цене", () => {
    test("TC-DESK-05: Проверка сортировки по цене - убывание", async ({ page }) => {
        /**
         * Тест проверяет, что сортировка "по цене" работает корректно:
         * При "По убыванию" цены идут в невозрастающем порядке
         */
        
        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        await homePage.selectSortBy("PRICE");
        await homePage.selectSortOrder("DESC");
        
        // Assert
        await homePage.assertPricesAreNonIncreasing();
    });
});
