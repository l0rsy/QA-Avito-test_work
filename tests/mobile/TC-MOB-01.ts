import { test } from "@playwright/test";
import { HomePage } from "../../pages/homePage/homePage";

test.describe("Мобильная версия - переключение темы", () => {
    test("TC-MOB-01: Переключение на светлую тему", async ({ page }) => {
        // Тест проверяет переключение на светлую тему

        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        
        // Если текущая тема темная - переключаем на светлую
        const currentTheme = await homePage.getCurrentTheme();
        if (currentTheme === "dark") {
            await homePage.toggleTheme();
        }
        
        // Assert
        await homePage.assertThemeIsLight();
    });
});
