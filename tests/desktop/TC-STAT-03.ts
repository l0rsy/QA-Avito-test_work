import { test, expect } from '@playwright/test';
import { StatisticPage } from '../../pages/statisticsPage/statisticsPage';

test.describe("Управление таймером статистики", () => {
    test("TC-STATS-03: Возобновление таймера", async ({ page }) => {
        // Тест проверяет, что кнопка возобновления таймера начинает его работу: появляется время, другая иконка и убирается сообщение
        
        // Arrange
        const statsPage = new StatisticPage(page);
        
        // Act
        await statsPage.open();
        await statsPage.clicktimerToggleButton();

        await statsPage.assertTimerIsStopped();
        await statsPage.assertTimerToggleIsPlayIcon();
        
        await statsPage.clicktimerToggleButton();

        // Assert
        await statsPage.assertTimerIsActive();
        await statsPage.assertTimerToggleIsPauseIcon();
    });
});