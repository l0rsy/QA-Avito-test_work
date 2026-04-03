import { expect, Locator, Page } from "@playwright/test";

export class BasePage {
    protected page: Page;
    
    constructor(page: Page) {
        this.page = page;
    }

    // Перехода на URL
    async navigate(url: string) {
        await this.page.goto(url);
    }

    // Ожидание обновления страницы
    async waitForListUpdate(selector: Locator) {
        const loadingIndicator = selector;
        // Виден ли индикатор загрузки?
        if (await loadingIndicator.isVisible().catch(() => false)) {

            await loadingIndicator.waitFor({ state : 'hidden', timeout : 10000 });
        }
        await this.page.waitForTimeout(500);
    }

    // Заполнение поля ввода
    async fillInput(selector: Locator, value: string) {
        const inputLocator = selector;

        await inputLocator.clear();
        if (value) {await inputLocator.fill(value)}
    }
}
