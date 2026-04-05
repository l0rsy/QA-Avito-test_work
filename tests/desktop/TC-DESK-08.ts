import { test } from "@playwright/test";
import { HomePage } from "../../pages/homePage/homePage";

test.describe("Тогл 'Только срочные'", () => {
    test("TC-DESK-08: Проверка тогла 'Только срочные' ", async ({ page }) => {
        /**
         * Тест проверяет, что тогл работает корректно:
         * При активации тогла отображаются только объявления с статусом "Срочно"
         */
        
        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        
        const hasBoth = await homePage.assertBothUrgentAndRegularItems();
        test.skip(!hasBoth, "В ленте нет одновременно срочных и обычных объявлений для проверки");

        await homePage.toggleUrgentOnly(true);

        // Assert
        await homePage.assertAllItemsHaveUrgentIndicator();

    });
});
