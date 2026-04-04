import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../basePage';

export class HomePage extends BasePage {
    // Локаторы
    private readonly searchInput : Locator; // Поле поиска

    private readonly priceFromInput: Locator; // Поле "Цена от"
    private readonly priceToInput: Locator; // Поле "Цена до"

    private readonly itemPrices: Locator; // Цены объявлений
    private readonly resetFiltersSideButton: Locator; // Кнопка "Сбросить"

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

    private readonly categorySelect: Locator; // Селектор с категориями

    private readonly urgentToggle: Locator; // Тогл "Только срочные"
    private readonly urgentIndicator: Locator; // Индикатор "Срочно" на объявлении



    constructor(page: Page) {
        super(page);
        // Определяем локаторы
        this.searchInput = page.locator('input[placeholder="Введите название..."]');
        this.priceFromInput = page.locator('input[placeholder="От"]');
        this.priceToInput = page.locator('input[placeholder="До"]');
        this.itemPrices = page.locator('div[class="_card__price_15fhn_241"]');
        this.resetFiltersSideButton = page.getByRole('button', { name: 'Сбросить' });
        this.realoadListInfo = page.getByText("Обновление данных");
        this.emptyStateTitle = page.getByText("📭 Объявления не найдены");
        this.emptyStateHint = page.getByText('Попробуйте изменить параметры фильтрации');
        this.resetFiltersButton = page.getByRole('button', { name: 'Сбросить фильтры' });
        this.sortBy = page.locator('xpath=//*[@id="root"]/div/div[1]/div[2]/div/div[1]/select');
        this.sortOrder = page.locator('xpath=//*[@id="root"]/div/div[1]/div[2]/div/div[2]/select');
        this.categorySelect = page.locator('xpath=//*[@id="root"]/div/div[2]/aside/div[2]/div[2]/select');
        this.urgentToggle = page.locator('span[class*="_urgentToggle__slider_h1vv9_21"]');
        this.urgentIndicator = page.locator('span[class*="_card__priority_15fhn_172"]:has-text("Срочно")');
 
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
    // Метод для нажатия кнопки "Сбросить"
    async clickSideResetFilters() {
        await this.resetFiltersSideButton.click();
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

    // Метод для получения количества объявлений на странице
    async getItemsCount(): Promise<number> {
        return await this.itemPrices.count();
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

    // Метод для получения доступных категорий
    async getAllCategories(): Promise<{ value: string; name: string }[]> {
        const categories: {value: string; name: string}[] = [];

        const options = await this.categorySelect.locator('option').all();
        for (const option of options) {
            const value = await option.getAttribute('value');
            const name = await option.textContent();

            if (value !== '' && value !== null && name) {
                categories.push({value, name});
            }
        }
        return categories;
    }

    // Метод для выбора категории по значению
    async selectCategory(categoryValue: string) {
        await this.categorySelect.selectOption({value: categoryValue});
        await this.waitForListUpdate(this.realoadListInfo);
    }

    // Метод для получения категории объявления по индексу
    async getItemCategory(itemIndex: number): Promise<string> {
        const categoryLocator = this.itemPrices.nth(itemIndex)
            .locator('..') // Поднимаемся к родителю
            .locator('div[class*="_card__category_15fhn_259"]');
        
        const categoryText = await categoryLocator.textContent();
        if (!categoryText) {
            throw new Error(`Не удалось получить категорию для объявления ${itemIndex + 1}`);
        }
        return categoryText.trim();
    }

    // Методя для получения ВСЕХ категорий на странице
    async getAllItemsCategories(): Promise<string[]> {
        const categories: string[] = [];
        const itemsCount = await this.itemPrices.count();
        
        for (let i = 0; i < itemsCount; i++) {
            const category = await this.getItemCategory(i);
            categories.push(category);
        }
        
        return categories;
    }

    // Метод для нажатия на тогл "Только срочные"
    async toggleUrgentOnly(enable: boolean) {
        const isChecked = await this.urgentToggle.evaluate(el => {
            const input = el.closest('label')?.querySelector('input[type="checkbox"]');
            return input ? (input as HTMLInputElement).checked : false;
        });
        
        if (isChecked !== enable) {
            await this.urgentToggle.click();
            await this.waitForListUpdate(this.realoadListInfo);
        }
    }

    // Метод для получения количества объявлений без индикатора "Срочно"
    async getItemsWithoutUrgentIndicatorCount(): Promise<number> {
        const totalCount = await this.itemPrices.count();
        const urgentCount = await this.urgentIndicator.count();
        return totalCount - urgentCount;
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

    // Проверка, что все объявления соответствуют выбранной категории
    async assertAllItemsMatchCategory(expectedCategory: string) {
        const itemsCount = await this.itemPrices.count();

        if (itemsCount === 0) {
            throw new Error("Нет объявлений для проверки категории");
        }
        for (let i = 0; i < itemsCount; i++) {
            // Получаем категорию объявления (нужно уточнить локатор)
            const itemCategory = await this.getItemCategory(i);
            
            expect(itemCategory, 
                `Объявление ${i + 1} имеет категорию "${itemCategory}", ожидалась "${expectedCategory}"`)
                .toBe(expectedCategory);
        }
    }

    // Проверка, что все объявления принадлежат одной категории
    async assertAllItemsHaveSameCategory(expectedCategory: string) {
        const categories = await this.getAllItemsCategories();
        
        for (let i = 0; i < categories.length; i++) {
            expect(categories[i], 
                `Объявление ${i + 1} имеет категорию "${categories[i]}", ожидалась "${expectedCategory}"`)
                .toBe(expectedCategory);
        }
    }

    // Проверка, что в ленте есть объявления из разных категорий
    async assertItemsHaveMultipleCategories() {
        const categories = await this.getAllItemsCategories();
        const uniqueCategories = [...new Set(categories)];
        
        expect(uniqueCategories.length, 
            `После сброса фильтра должно быть несколько категорий, найдено: ${uniqueCategories.join(', ')}`)
            .toBeGreaterThan(1);
    }

    // Проверка, что в ленте есть и срочные, и обычные объявления
    async assertBothUrgentAndRegularItems(): Promise<boolean> {
        const urgentCount = await this.urgentIndicator.count();
        const totalCount = await this.itemPrices.count();
        
        return urgentCount > 0 && urgentCount < totalCount;
    }

    // Проверка, что все объявления имеют индикатор "Срочно"
    async assertAllItemsHaveUrgentIndicator() {
        const itemsCount = await this.itemPrices.count();
        
        const urgentIndicators = await this.urgentIndicator.count();
        
        expect(urgentIndicators, 
            `Количество объявлений (${itemsCount}) не совпадает с количеством индикаторов "Срочно" (${urgentIndicators})`)
            .toBe(itemsCount);
        
        // Дополнительная проверка - каждый индикатор видим
        for (let i = 0; i < urgentIndicators; i++) {
            await expect(this.urgentIndicator.nth(i), 
                `Индикатор "Срочно" у объявления ${i + 1} не видим`)
                .toBeVisible();
        }
    }

    // Проверка, что есть объявления без индикатора "Срочно"
    async assertThereAreItemsWithoutUrgentIndicator() {
        const nonUrgentCount = await this.getItemsWithoutUrgentIndicatorCount();
        
        expect(nonUrgentCount, 
            `После выключения тогла должны появиться объявления без индикатора "Срочно"`)
            .toBeGreaterThan(0);
    }
    
    // Проверка, что все цены находятся в заданном диапазоне
    async assertAllPricesAreInRange(minPrice: string, maxPrice: string) {
        const min = parseInt(minPrice);
        const max = parseInt(maxPrice);
        const prices = await this.getAllPrices();
        
        for (let i = 0; i < prices.length; i++) {
            expect(prices[i], 
                `Цена объявления ${i + 1} (${prices[i]}) ниже минимальной границы ${min}`)
                .toBeGreaterThanOrEqual(min);
            
            expect(prices[i], 
                `Цена объявления ${i + 1} (${prices[i]}) выше максимальной границы ${max}`)
                .toBeLessThanOrEqual(max);
        }
    }
}

