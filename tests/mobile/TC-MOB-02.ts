import { test } from '@playwright/test';
import { HomePage } from '../../pages/homePage/homePage';

test.describe("Мобильная версия - переключение темы", () => {
    test("TC-MOB-02: Переключение на темную тему", async ({ page }) => {
        // Тест проверяет переключение на темную тему

        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        
        // Если текущая тема светлая - переключаем на темную
        const currentTheme = await homePage.getCurrentTheme();
        if (currentTheme === 'light') {
            await homePage.toggleTheme();
        }
        
        // Assert
        await homePage.assertThemeIsDark();
    });
});