import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class HomePage extends BasePage {
    // Локаторы
    private readonly searchInput : Locator; // Поле поиска

    private readonly priceFromInput: Locator; // Поле "Цена от"
    private readonly priceToInput: Locator; // Поле "Цена до"

    private readonly itemPrices: Locator; // Цены объявлений

    private readonly realoadListInfo: Locator; // Обновление списка объявлений

    private readonly emptyStateTitle: Locator; // Надпись "Объявления не найдены"
    private readonly emptyStateHint: Locator; // Надпись "Попробуйте изменить параметры фильтрации"
    private readonly resetFiltersButton: Locator; // Кнопка "Сбросить фильтры"

    private readonly sortBy: Locator; // "Сортировать по"
    // Значения для сортировки
    private readonly sortOptions = {
        DATE: 'createdAt',
        PRICE: 'price',
        PRIORITY: 'priority'
    } as const;

    private readonly sortOrder: Locator; // "Порядок"
    // Статусы порядка сортировки
    private readonly sortOrders = {
        ASC: 'asc',
        DESC: 'desc' 
    } as const;    


    constructor(page: Page) {
        super(page);
        // Определяем локаторы
        this.searchInput = page.locator('input[placeholder="Введите название..."]');
        this.priceFromInput = page.locator('input[placeholder="От"]');
        this.priceToInput = page.locator('input[placeholder="До"]');
        this.itemPrices = page.locator('div[class="_card__price_15fhn_241"]');
        this.realoadListInfo = page.getByText("Обновление данных");
        this.emptyStateTitle = page.getByText("📭 Объявления не найдены");
        this.emptyStateHint = page.getByText('Попробуйте изменить параметры фильтрации');
        this.resetFiltersButton = page.getByRole('button', { name: 'Сбросить фильтры' });
        this.sortBy = page.locator('xpath=//*[@id="root"]/div/div[1]/div[2]/div/div[1]/select');
        this.sortOrder = page.locator('xpath=//*[@id="root"]/div/div[1]/div[2]/div/div[2]/select');
 
    }

    // Открыть главную страницу
    async open() {
        await this.navigate('/');
        await this.waitForListUpdate(this.realoadListInfo);
    }

    // Метод для установления значений в поля "От" и "До"
    async setPriceRange(from: string, to: string) {
        if (from) {
            await this.fillInput(this.priceFromInput, from);
        }
        if (to) {
            await this.fillInput(this.priceToInput, to);
        }
        await this.waitForListUpdate(this.realoadListInfo);
    }

    // Метод для получения цены первого объявления
    async getFirstItemPrice() {
        const priceText = await this.itemPrices.first().textContent();
        if (!priceText) {
            throw new Error("Не удалось получить цену объявления");
        }
        return parseInt(priceText.replace(/[^0-9]/g, ""));
    }

    // Метод для получения всех цен на странице
    async getAllPrices() {
        const prices: number[] = [];
        const pricesCount = await this.itemPrices.count();

        for (let i = 0; i < pricesCount; i++) {
            const priceText = await this.itemPrices.nth(i).textContent();
            if (priceText) {
                const price = parseInt(priceText.replace(/[^0-9]/g, ""));
                if (!isNaN(price)) {
                    prices.push(price);
                }
            }
        }
        return prices;
    }

    // Метод для выбор ТИПА сортировки
    async selectSortBy(sortType: 'DATE' | 'PRICE' | 'PRIORITY') {
        const sortValue = this.sortOptions[sortType];
        
        await this.sortBy.selectOption({ value: sortValue });
        
        await this.waitForListUpdate(this.realoadListInfo);
    }

    // Метод для выбора ПОРЯДКА сортировки
    async selectSortOrder(orderType: 'ASC' | 'DESC') {
        const sortValue = this.sortOrders[orderType];
        
        await this.sortOrder.selectOption({ value: sortValue });
        
        await this.waitForListUpdate(this.realoadListInfo);
    }

    // ===================== ASSERTS =====================
    
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

    // Проверка, что поля "От" и "До" подсвечиваются красным при ошибке
    async assertPriceInputsAreHighlightedAsInvalid() {
        // Проверяем поле "От"
        const fromInputHasError = await this.priceFromInput.evaluate((element) => {
            const el = element as HTMLInputElement;
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

    // Проверка, что поле "От" пустое
    async assertPriceFromInputIsEmpty() {
        const fromValue = await this.priceFromInput.inputValue();
        expect(fromValue, 'Поле "От" должно быть пустым').toBe('');
    }

    // Проверка, что поле "До" пустое
    async assertPriceToInputIsEmpty() {
        const toValue = await this.priceToInput.inputValue();
        expect(toValue, 'Поле "До" должно быть пустым').toBe('');
    }

    // Проверка, что цены идут в неубывающем порядке (>=)
    async assertPricesAreNonDecreasing() {
        const prices = await this.getAllPrices();

        if (prices.length == 0) {throw new Error("Нет цен для проверки порядка сортировки");}

        for (let i = 0; i < prices.length - 1; i++) {
            expect(prices[i], 
                `Цена ${prices[i]} (позиция ${i + 1}) не меньше или равна следующей цене ${prices[i + 1]} (позиция ${i + 2})`)
                .toBeLessThanOrEqual(prices[i + 1]);
        }
    }

    // Проверка, что цены идут в невозрастающем порядке (<=)
    async assertPricesAreNonIncreasing() {
        const prices = await this.getAllPrices();
        
        if (prices.length === 0) {
            throw new Error("Нет цен для проверки порядка сортировки");
        }
        
        for (let i = 0; i < prices.length - 1; i++) {
            expect(prices[i], 
                `Цена ${prices[i]} (позиция ${i + 1}) не больше или равна следующей цене ${prices[i + 1]} (позиция ${i + 2})`)
                .toBeGreaterThanOrEqual(prices[i + 1]);
        }
    }

}

