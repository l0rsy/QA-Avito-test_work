import { test } from "@playwright/test";
import { HomePage } from "../../pages/homePage/homePage";

test.describe("Сортировка по цене", () => {
    test("TC-DESK-04: Проверка сортировки по цене - возрастание", async ({ page }) => {
        /**
         * Тест проверяет, что сортировка "по цене" работает корректно:
         * При "По возрастанию" цены идут в неубывающем порядке
         */
        
        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        await homePage.selectSortBy("PRICE");
        await homePage.selectSortOrder("ASC");
        
        // Assert
        await homePage.assertPricesAreNonDecreasing();
    });
});
