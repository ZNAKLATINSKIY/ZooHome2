# 🐾 ZooHome — Питомник с бронированием визитов

Полнофункциональное веб-приложение на **Vue 3 + Vite + Firebase**.

## 🚀 Быстрый старт

```bash
# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev

# Сборка для production
npm run build
```

## 📂 Структура проекта

```
src/
├── assets/
│   └── main.css              # Глобальные стили
├── components/
│   ├── animals/
│   │   ├── AnimalCard.vue    # Карточка питомца в каталоге
│   │   └── ReviewCard.vue    # Карточка отзыва
│   ├── bookings/
│   │   └── BookingCard.vue   # Карточка записи
│   ├── layout/
│   │   ├── AppHeader.vue     # Шапка с навигацией
│   │   └── AppFooter.vue     # Подвал
│   └── ui/
│       ├── StarsDisplay.vue  # Отображение рейтинга
│       ├── StarRating.vue    # Интерактивный выбор рейтинга
│       └── ToastContainer.vue# Уведомления
├── composables/
│   └── useToast.js           # Глобальные уведомления
├── firebase/
│   ├── config.js             # Firebase инициализация
│   └── seed.js               # Тестовые данные
├── router/
│   └── index.js              # Vue Router
├── store/
│   ├── auth.js               # Pinia: авторизация
│   ├── animals.js            # Pinia: питомцы
│   ├── bookings.js           # Pinia: записи
│   └── reviews.js            # Pinia: отзывы
└── views/
    ├── HomeView.vue          # Главная — каталог с фильтрами
    ├── AnimalView.vue        # Детальная страница питомца
    ├── AuthView.vue          # Вход / Регистрация
    ├── BookingsView.vue      # Мои записи (real-time)
    ├── ProfileView.vue       # Личный кабинет
    └── AdminView.vue         # Панель администратора
```

## 🔥 Firebase настройка

### 1. Правила безопасности
Скопируйте содержимое `firestore.rules` в **Firebase Console → Firestore → Rules**.

### 2. Индексы
Импортируйте `firestore.indexes.json` через Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:indexes
```

### 3. Заполнить тестовыми данными
В браузере откройте консоль и выполните:
```javascript
import { seedDatabase } from './src/firebase/seed.js'
await seedDatabase()
```

### 4. Назначить администратора
В Firebase Console → Firestore → `users/{ваш_uid}` измените поле `role` на `"admin"`.

## ✅ Соответствие ТЗ

| Требование | Реализация |
|---|---|
| Аутентификация | Firebase Auth + Pinia (auth.js) |
| Каталог с пагинацией | HomeView + startAfter cursor |
| Поиск + фильтры + сортировка | HomeView — debounced search, фильтры по категории/полу/доступности |
| Детальная страница | AnimalView — информация, отзывы, бронирование, похожие |
| Личный кабинет | ProfileView — профиль, история записей, мои отзывы |
| Записи / История | BookingsView — активные (real-time) + история |
| Real-time | onSnapshot в HomeView (новые питомцы) + BookingsView (статусы) |
| Админ-панель | AdminView — CRUD питомцев, управление записями, пользователями, модерация отзывов |
| Статистика | AdminView — счётчики через getCountFromServer |
| Правила безопасности | firestore.rules — роли user/admin |
| Оптимизация запросов | Денормализация данных, составные индексы |
| Схема БД | DB_SCHEMA.md |
| Адаптивность | CSS media queries — мобильный/планшет/десктоп |

## 🎨 Технологии

- **Vue 3** (Composition API, `<script setup>`)
- **Vite** — сборщик
- **Pinia** — state management
- **Vue Router 4** — маршрутизация с guards
- **Firebase 10** — Firestore + Auth
- **CSS3** — custom properties, grid, flexbox, адаптивность
