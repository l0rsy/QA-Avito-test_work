import { test, expect } from "@playwright/test";
import { HomePage } from "../../pages/homePage/homePage";

test.describe("Тогл 'Только срочные'", () => {
    test("TC-DESK-09: Проверка выключения тогла 'Только срочные' ", async ({ page }) => {
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
        const itemsCountWithUrgentOnly = await homePage.getItemsCount();
        await homePage.toggleUrgentOnly(false);

        // Assert
        const itemsCountAfterToggle = await homePage.getItemsCount();
        expect(itemsCountAfterToggle, 
            "После выключения тогла количество объявлений должно увеличиться")
            .toBeGreaterThan(itemsCountWithUrgentOnly);
        
        await homePage.assertThereAreItemsWithoutUrgentIndicator();

    });
});
