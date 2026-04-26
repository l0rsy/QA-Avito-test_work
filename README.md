# QA: manual testing + E2E autotests for testboard.avito.com

## Инструкция по запуску тестов для задания 2.2

- Node.js 18+ (лучше LTS)
- npm 9+

### Установка
1) Установить зависимости:

```bash
npm install
```
2) Удостовериться, что установились браузеры
```bash
npx playwright install
```


### Запуск тестов

Запустить все тесты:

```bash
npx playwright test
```

Запустить конкретный тестовый файл TEST_NAME.ts в ДЕСКТОПНОЙ версии:
```bash
npx playwright test tests/PATH_TO_TEST/TEST_NAME.ts --project=chromium
```

Запустить конкретный тестовый файл TEST_NAME.ts в МОБИЛЬНОЙ версии:
```bash
npx playwright test tests/PATH_TO_TEST/TEST_NAME.ts --project=mobile-phone
```

## Линтер (ESLint)

#### Проверить проект линтером:
```bash
npx eslint . 
```
Пустота означает, что ошибок нет
#### Запустить линтер для конкретного файла:
```bash
npx eslint PATH_TO_TEST/TEST_NAME.ts --fix
```
#### Запустить линтер для всего проекта:
```bash
npx eslint . --fix
```