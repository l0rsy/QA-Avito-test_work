import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/homePage/homePage';

test.describe("Мобильная версия - сохранение темы", () => {
    test("TC-MOB-03: Переключение и сохранение темы после выхода", async ({ page }) => {
        // Тест проверяет сохранение переключенной темы после выхода с сайта

        // Arrange
        const homePage = new HomePage(page);
        
        // Act
        await homePage.open();
        const initialTheme = await homePage.getCurrentTheme();
        await homePage.toggleTheme();
        const newTheme = await homePage.getCurrentTheme();
        expect(newTheme, 'Тема должна измениться после переключения').not.toBe(initialTheme);
        
        // Перезагружаем страницу
        await page.reload({ waitUntil: 'networkidle' });
        await page.locator('body').waitFor({ state: 'visible' });
        
        // Assert
        const themeAfterReload = await homePage.getCurrentTheme();
        
        expect(themeAfterReload, 
            `Тема должна быть "${newTheme}" после перезагрузки, но стала "${themeAfterReload}"`)
            .toBe(newTheme);
    });
});