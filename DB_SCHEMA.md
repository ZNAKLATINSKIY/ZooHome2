# 📊 Схема базы данных — ZooHome

## Коллекции Firestore

---

### 🐾 `animals` — Каталог питомцев

```
animals/{animalId}
├── name: string              // "Барсик"
├── species: string           // "Кот"
├── breed: string             // "Сибирская"
├── age: number               // 2
├── gender: "male" | "female"
├── category: "cats"|"dogs"|"birds"|"rodents"|"other"
├── description: string
├── image: string             // URL фото
├── price: number             // стоимость визита в тенге
├── tags: string[]            // ["ласковый","привит"]
├── available: boolean
├── rating: number            // 4.8 (денормализован для быстрой выборки)
├── reviewsCount: number      // денормализован
└── createdAt: Timestamp
```

**Индексы:** category+createdAt, category+price, category+rating, gender+createdAt, available+createdAt

---

### 👤 `users` — Профили пользователей

```
users/{uid}                   // uid из Firebase Auth
├── displayName: string
├── email: string
├── role: "user" | "admin"
├── phone: string
├── bio: string
├── avatar: string            // URL аватара
└── createdAt: Timestamp
```

---

### 📅 `bookings` — Записи на визит

```
bookings/{bookingId}
├── userId: string            // uid пользователя
├── animalId: string
├── animalName: string        // денормализовано
├── animalImage: string       // денормализовано
├── animalSpecies: string     // денормализовано
├── animalBreed: string       // денормализовано
├── price: number             // денормализовано на момент записи
├── visitDate: string         // "2025-08-15"
├── notes: string
├── status: "pending"|"confirmed"|"completed"|"cancelled"
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Индексы:** userId+status+createdAt

---

### ⭐ `reviews` — Отзывы

```
reviews/{reviewId}
├── userId: string
├── userName: string          // денормализовано
├── animalId: string
├── rating: number            // 1–5
├── text: string
└── createdAt: Timestamp
```

**Индексы:** animalId+createdAt, userId+createdAt

---

## 🔒 Правила безопасности

| Коллекция | Чтение       | Создание          | Обновление            | Удаление              |
|-----------|-------------|-------------------|----------------------|-----------------------|
| animals   | Все         | Только admin      | Только admin          | Только admin          |
| users     | Владелец/admin | Только сам     | Владелец/admin        | Только admin          |
| bookings  | Владелец/admin | Auth (свои)    | Владелец/admin        | Владелец/admin        |
| reviews   | Все         | Auth (свои)       | Владелец/admin        | Владелец/admin        |

---

## ⚡ Real-time подписки (onSnapshot)

- `HomeView.vue` — подписка на новые животные (уведомление о добавлении)
- `BookingsView.vue` — подписка на активные записи пользователя (статусы в реальном времени)

## 🚀 Оптимизации

- **Денормализация данных** в `bookings` (имя, фото, цена питомца) — быстрая загрузка без join
- **Денормализация** `rating` и `reviewsCount` в `animals` — сортировка без агрегации
- **Пагинация** через `startAfter` cursor (по 9 элементов)
- **Индексы** для всех составных запросов
