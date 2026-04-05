import { test, expect } from '@playwright/test';
import { StatisticPage } from '../../pages/statisticsPage/statisticsPage';

test.describe("Кнопка 'Обновить'", () => {
    test("TC-STATS-01: Нажатие кнопки 'Обновить'", async ({ page }) => {
        // Тест проверяет, что кнопка "Обновить" сбрасывает таймер до 5:00
        
        // Arrange
        const statsPage = new StatisticPage(page);
        
        // Act
        await statsPage.open();
        await statsPage.clickRefreshButtonAndVerifyReset(); // Assert included
    });
});