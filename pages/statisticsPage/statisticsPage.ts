import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../basePage";

export class StatisticPage extends BasePage {
    // Локаторы
    private readonly statsNavLink: Locator; // Кнопка "Статистика"
    private readonly refreshButton: Locator; // Кнопка "Обновить"
    private readonly timerToggleButton: Locator; // Кнопка "Пауза"
    private readonly timeValue: Locator; // Отображаемое время
    private readonly autoUpdateOffMessage: Locator; // Сообщение "Автообновление выключено"

    private readonly DEFAULT_TIME = "4:59";

    constructor(page: Page) {
        super(page);

        this.statsNavLink = page.locator("a[href=\"/stats\"]");
        this.refreshButton = page.locator("span._text_ir5wu_57:has-text(\"Обновить\")");
        this.timerToggleButton = page.locator("span._toggleIcon_ir5wu_94");
        this.timeValue = page.locator("span._timeValue_ir5wu_112");
        this.autoUpdateOffMessage = page.locator("span:has-text(\"Автообновление выключено\")");
    }

    // Метод для открытия страницы статистики
    async open() {
        await this.navigate("/");
        await this.statsNavLink.click();
    }

    // Метод для нажатия кнопки "Обновить"
    async clickRefreshButton() {
        await this.refreshButton.click();
    }

    // Метод для нажатия кнопки "Пауза"
    async clickTimerToggleButton() {
        await this.timerToggleButton.click();
        await this.page.waitForTimeout(500);
    }

    // Метод для получения текущего отображаемого времени
    async getDisplayedTime() {
        const timeText = await this.timeValue.textContent();
        if (!timeText) {
            throw new Error("Не удалось получить значения таймера");
        }
        return timeText.trim();
    }

    // Метод для нажатия кнопки "Обновить" с мгновенной проверкой сброса таймера
    async clickRefreshButtonAndVerifyReset() {
        await this.page.waitForTimeout(2000);
        await this.refreshButton.click();
        
        // Мгновенная проверка, что время стало 5:00
        const currentTime = await this.getDisplayedTime();
        expect(currentTime, `Таймер должен показывать ${this.DEFAULT_TIME}, но показывает ${currentTime}`)
            .toBe(this.DEFAULT_TIME);
    }

    // Проверки активности таймера
    async isTimerActive() {
        const isTimeVisible = await this.timeValue.isVisible().catch(() => false);
        const isOffMessageVisible = await this.autoUpdateOffMessage.isVisible().catch(() => false);
        return isTimeVisible && !isOffMessageVisible;
    }

    // Проверка остановлен ли таймер
    async isTimerStopped() {
        const isTimeHidden = !(await this.timeValue.isVisible().catch(() => false));
        const isOffMessageVisible = await this.autoUpdateOffMessage.isVisible().catch(() => false);
        return isTimeHidden && isOffMessageVisible;
    }

    // Получить икноку кнопки таймера (⏸ или ▶️)
    async getTimerToggleIcon() {
        const iconText = await this.timerToggleButton.textContent();
        return iconText?.trim() || "";
    }

    // ===================== ASSERTS =====================

    // Проверка, что таймер активен
    async assertTimerIsActive() {
        expect(await this.isTimerActive(), "Таймер должен быть активным").toBe(true);
        await expect(this.timeValue, "Время должно отображаться").toBeVisible();
        await expect(this.autoUpdateOffMessage, "Сообщение о выключении не должно отображаться").toBeHidden();
    }

    // Проверка, что таймер остановлен
    async assertTimerIsStopped() {
        expect(await this.isTimerStopped(), "Таймер должен быть остановлен").toBe(true);
        await expect(this.autoUpdateOffMessage, "Сообщение \"Автообновление выключено\" должно отображаться").toBeVisible();
        await expect(this.timeValue, "Время не должно отображаться").toBeHidden();
    }

    // Проверка, что кнопка таймера имеет иконку паузы (⏸)
    async assertTimerToggleIsPauseIcon() {
        const icon = await this.getTimerToggleIcon();
        expect(icon, "Кнопка таймера должна показывать иконку паузы (⏸)").toBe("⏸");
    }

    // Проверка, что кнопка таймера имеет иконку запуска (▶️)
    async assertTimerToggleIsPlayIcon() {
        const icon = await this.getTimerToggleIcon();
        expect(icon, "Кнопка таймера должна показывать иконку запуска (▶️)").toBe("▶️");
    }

}


