# Racing Web

Frontend для редактора PPTX-отчётов о гоночных заездах.

## Технологии

- **React 18** — UI библиотека
- **TypeScript** — типизация
- **Vite** — сборщик
- **TanStack Query** — управление серверным состоянием
- **Tailwind CSS** — стилизация
- **Shadcn/UI** — компоненты
- **React Router** — маршрутизация

## Структура проекта

```
src/
├── components/               # React компоненты
│   ├── ui/                   # Shadcn UI компоненты
│   ├── layout/               # Layout компоненты
│   └── report-editor/        # Редактор отчётов
│       ├── report-editor.tsx
│       ├── report-header.tsx
│       ├── days-list.tsx
│       ├── day-editor.tsx
│       ├── telemetry-table.tsx
│       ├── report-slides-section.tsx
│       ├── report-slide-item.tsx
│       ├── see-you-soon-section.tsx
│       └── file-upload.tsx
├── pages/                    # Страницы приложения
│   ├── login-page.tsx
│   ├── documents-page.tsx
│   └── editor-page.tsx
├── context/                  # React Context
│   ├── auth-context.tsx      # Авторизация
│   ├── theme-context.tsx     # Темная/светлая тема
│   └── i18n-context.tsx      # Локализация (en, ru, ee)
├── hooks/                    # Custom hooks
├── services/                 # API сервисы
│   └── api.ts                # Axios + API методы
├── lib/                      # Утилиты
│   ├── utils.ts              # cn() и другие
│   └── i18n/                 # Переводы
│       └── translations/
│           ├── en.ts
│           ├── ru.ts
│           └── ee.ts
└── types/                    # TypeScript типы
    └── index.ts
```

## Быстрый старт

### Требования

- Node.js 20+
- Yarn
- Запущенный racing-api (порт 3001)

### Установка

```bash
# Установка зависимостей
yarn install
```

### Запуск

```bash
# Разработка (порт 3000)
yarn dev

# Production сборка
yarn build

# Preview production
yarn preview
```

## Команды

| Команда | Описание |
|---------|----------|
| `yarn dev` | Запуск dev сервера |
| `yarn build` | Production сборка |
| `yarn preview` | Preview production |
| `yarn lint` | ESLint проверка |
| `yarn lint:fix` | ESLint с авто-исправлением |
| `yarn format` | Prettier форматирование |

## Функциональность

### Авторизация
- JWT токены
- Автоматический logout при 401
- Защищённые маршруты

### Редактор отчётов
- Редактирование метаданных документа (название, водитель, трек)
- Загрузка карты трассы
- Управление днями отчёта (Day 1, Day 2, ...)
- Редактирование условий дня (погода, шины, состояние трека)
- Загрузка фото Kart Checking (только Day 1)
- Таблица телеметрии (8 станций)
- Слайды отчёта DAY N: REPORT (текст + изображение)
- Загрузка фото See You Soon

### Локализация
- English (en)
- Русский (ru)
- Eesti (ee)

### Темы
- Светлая тема
- Тёмная тема
- Системная тема

## API Сервисы

```typescript
// Авторизация
authApi.login(credentials)
authApi.me()
authApi.logout()

// Документы
documentsApi.getAll(query)
documentsApi.getFull(id)
documentsApi.create(dto)
documentsApi.update(id, dto)
documentsApi.updateReport(id, dto)
documentsApi.delete(id)
documentsApi.downloadPptx(id)

// Дни
daysApi.getAll(documentId)
daysApi.create(documentId, dto)
daysApi.update(documentId, dayId, dto)
daysApi.delete(documentId, dayId)

// Телеметрия
telemetryApi.batchUpdate(dayId, dto)

// Слайды отчёта
reportSlidesApi.getAll(dayId)
reportSlidesApi.create(dayId, dto)
reportSlidesApi.update(dayId, slideId, dto)
reportSlidesApi.delete(dayId, slideId)
reportSlidesApi.reorder(dayId, dto)

// Файлы
filesApi.upload(file, type, context)
filesApi.delete(id)
```

## Типы файлов

- `TRACK_MAP` — карта трассы (документ)
- `KART_CHECKING` — фото проверки карта (Day 1)
- `SEE_YOU_SOON` — финальное фото (документ)
- `REPORT_SLIDE` — изображение к слайду отчёта (день)

## Структура редактора

```
EditorPage
└── ReportEditor
    ├── ReportHeader (метаданные документа)
    │   ├── Название, водитель, трек
    │   └── Карта трассы (FileUpload)
    ├── DaysList (список дней)
    │   └── DayEditor (редактор дня)
    │       ├── Условия (погода, шины, состояние)
    │       ├── Kart Checking (только Day 1)
    │       ├── TelemetryTable (8 станций)
    │       └── ReportSlidesSection
    │           └── ReportSlideItem (текст + изображение)
    └── SeeYouSoonSection (финальное фото)
```

## Переменные окружения

```env
# API URL (по умолчанию /api через proxy)
VITE_API_URL=/api
```

## Proxy конфигурация

В `vite.config.ts` настроен proxy на backend:

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```
