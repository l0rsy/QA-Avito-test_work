import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class HomePage extends BasePage {
    // Локаторы
    private readonly searchInput : Locator;     // Поле поиска
    private readonly priceFromInput: Locator;   // Поле "Цена от"
    private readonly priceToInput: Locator;     // Поле "Цена до"
    private readonly itemPrices: Locator;       // Цены объявлений
    private readonly realoadListInfo: Locator;  // Обновление списка объявлений

    constructor(page: Page) {
        super(page);
        // Определяем локаторы
        this.searchInput = page.locator('input[placeholder="Введите название..."]');
        this.priceFromInput = page.locator('input[placeholder="От"]');
        this.priceToInput = page.locator('input[placeholder="До"]');
        this.itemPrices = page.locator('div[class="_card__price_15fhn_241"]')
        this.realoadListInfo = page.locator('xpath=//div[text()="Обновление данных"]');
    }

    // Открыть главную страницу
    async open() {
        await this.navigate('/');
        await this.waitForListUpdate(this.realoadListInfo);
    }

    // Установить От и До
    async setPriceRange(from: string, to: string) {
        if (from) {
            await this.fillInput(this.priceFromInput, from);
        }
        if (to) {
            await this.fillInput(this.priceToInput, to);
        }
        await this.waitForListUpdate(this.realoadListInfo);
    }

    // Цена первого объявления
    async getFirstItemPrice() {
        const priceText = await this.itemPrices.first().textContent();
        if (!priceText) {
            throw new Error("Не удалось получить цену объявления");
        }
        return parseInt(priceText.replace(/[^0-9]/g, ""));
    }
    
    // Проверка вхождения цен объявлений в диапазон;
    async assertAllPricesAreInRangeFromFirstItem() {
        const firstItemPrice = await this.getFirstItemPrice();
        
        const minPrice = firstItemPrice - 0.1*firstItemPrice;
        const maxPrice = firstItemPrice + 0.1*firstItemPrice;
        
        const pricesCount = await this.itemPrices.count();
        
        for (let i = 0; i < pricesCount; i++) {
            const priceText = await this.itemPrices.nth(i).textContent();
            const price = parseInt(priceText?.replace(/[^0-9]/g, "") || "0");
            
            expect(price, `Цена объявления ${i + 1} (${price}) не в диапазоне ${minPrice}-${maxPrice}`)
                .toBeGreaterThanOrEqual(minPrice);
            expect(price, `Цена объявления ${i + 1} (${price}) не в диапазоне ${minPrice}-${maxPrice}`)
                .toBeLessThanOrEqual(maxPrice);
        }
    }




}

