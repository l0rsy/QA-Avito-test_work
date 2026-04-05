import { test  } from '@playwright/test';
import { StatisticPage } from '../../pages/statisticsPage/statisticsPage';

test.describe("Управление таймером статистики", () => {
    test("TC-STATS-02: Остановка таймера", async ({ page }) => {
        // Тест проверяет, что кнопка остановки таймера приостанавливает его работу, меняет иконку кнопки и выводит сообщение
        
        // Arrange
        const statsPage = new StatisticPage(page);
        
        // Act
        await statsPage.open();
        await statsPage.clickTimerToggleButton();
        
        // Assert
        await statsPage.assertTimerIsStopped();
        await statsPage.assertTimerToggleIsPlayIcon();
    });
});