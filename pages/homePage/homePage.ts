import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class HomePage extends BasePage {
    // Локаторы
    private readonly searchInput : Locator;     // Поле поиска
    private readonly priceFromInput: Locator;   // Поле "Цена от"
    private readonly priceToInput: Locator;     // Поле "Цена до"
    private readonly itemPrices: Locator;       // Цены объявлений
    private readonly realoadListInfo: Locator;  // Обновление списка объявлений
    private readonly emptyStateTitle: Locator;  // Надпись "Объявления не найдены"
    private readonly emptyStateHint: Locator;  // Надпись "Попробуйте изменить параметры фильтрации"
    private readonly resetFiltersButton: Locator;  // Кнопка "Сбросить фильтры"

    constructor(page: Page) {
        super(page);
        // Определяем локаторы
        this.searchInput = page.locator('input[placeholder="Введите название..."]');
        this.priceFromInput = page.locator('input[placeholder="От"]');
        this.priceToInput = page.locator('input[placeholder="До"]');
        this.itemPrices = page.locator('div[class="_card__price_15fhn_241"]')
        this.realoadListInfo = page.getByText("Обновление данных");
        this.emptyStateTitle = page.getByText("📭 Объявления не найдены")
        this.emptyStateHint = page.getByText('Попробуйте изменить параметры фильтрации');
        this.resetFiltersButton = page.getByRole('button', { name: 'Сбросить фильтры' });
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

    // Проверка состояния "Объявления не найдены"
    async assertEmptyStateIsVisible() {
        await expect(this.emptyStateTitle, 'Заголовок "Объявления не найдены" не отображается')
            .toBeVisible();
        await expect(this.emptyStateHint, 'Подсказка "Попробуйте изменить параметры фильтрации" не отображается')
            .toBeVisible();
        await expect(this.resetFiltersButton, 'Кнопка "Сбросить фильтры" не отображается')
            .toBeVisible();
    }

    // Проверка что поля "От" и "До" подсвечиваются красным при ошибке
    async assertPriceInputsAreHighlightedAsInvalid() {
        // Проверяем поле "От"
        const fromInputHasError = await this.priceFromInput.evaluate((element) => {
            const el = element as HTMLInputElement;
            // Проверяем различные признаки ошибки
            return el.classList.contains('error') ||
                   el.classList.contains('_error') ||
                   el.classList.contains('invalid') ||
                   el.getAttribute('aria-invalid') === 'true' ||
                   getComputedStyle(el).borderColor === 'rgb(255, 0, 0)' ||
                   getComputedStyle(el).borderColor === 'red' ||
                   el.style.borderColor === 'red';
        });
        
        // Проверяем поле "До"
        const toInputHasError = await this.priceToInput.evaluate((element) => {
            const el = element as HTMLInputElement;
            return el.classList.contains('error') ||
                   el.classList.contains('_error') ||
                   el.classList.contains('invalid') ||
                   el.getAttribute('aria-invalid') === 'true' ||
                   getComputedStyle(el).borderColor === 'rgb(255, 0, 0)' ||
                   getComputedStyle(el).borderColor === 'red' ||
                   el.style.borderColor === 'red';
        });
        
        expect(fromInputHasError, 
            `Поле "От" должно быть подсвечено красным при min > max 
            ИЛИ должно быть другое подобное поведение, прописанное в ТЗ. Нужно уточнить`)
            .toBe(true);
    
        expect(toInputHasError, 
            `Поле "До" должно быть подсвечено красным при min > max 
            ИЛИ должно быть другое подобное поведение, прописанное в ТЗ. Нужно уточнить`)
            .toBe(true);
    }
}

