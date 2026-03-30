// src/firebase/seed.js
// Run this once to populate Firestore with demo data
// Import and call seedDatabase() from browser console or a temp component

import { db } from './config.js'
import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore'

const animals = [
  {
    name: 'Барсик',
    species: 'Кот',
    breed: 'Сибирская',
    age: 2,
    gender: 'male',
    description: 'Ласковый и игривый котёнок. Обожает играть с мячиками и сидеть на коленях. Привит, стерилизован.',
    price: 1500,
    category: 'cats',
    tags: ['ласковый', 'игривый', 'привит'],
    available: true,
    rating: 4.8,
    reviewsCount: 12,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Рекс',
    species: 'Собака',
    breed: 'Лабрадор',
    age: 3,
    gender: 'male',
    description: 'Дружелюбный и активный пёс. Любит прогулки и детей. Прошёл курс дрессировки.',
    price: 3500,
    category: 'dogs',
    tags: ['дружелюбный', 'активный', 'дрессированный'],
    available: true,
    rating: 4.9,
    reviewsCount: 23,
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Нюша',
    species: 'Кошка',
    breed: 'Британская',
    age: 1,
    gender: 'female',
    description: 'Спокойная и нежная кошечка. Идеальна для квартиры. Очень умная.',
    price: 2000,
    category: 'cats',
    tags: ['спокойная', 'нежная', 'умная'],
    available: true,
    rating: 4.7,
    reviewsCount: 8,
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Бобик',
    species: 'Собака',
    breed: 'Хаски',
    age: 4,
    gender: 'male',
    description: 'Энергичный и верный пёс. Любит активный отдых и длинные прогулки. Красивый окрас.',
    price: 4000,
    category: 'dogs',
    tags: ['энергичный', 'верный', 'активный'],
    available: true,
    rating: 4.6,
    reviewsCount: 19,
    image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Пуговка',
    species: 'Кролик',
    breed: 'Карликовый',
    age: 1,
    gender: 'female',
    description: 'Милый карликовый кролик. Очень чистоплотный. Любит морковку и ласку.',
    price: 800,
    category: 'rodents',
    tags: ['милый', 'чистоплотный', 'ручной'],
    available: true,
    rating: 4.5,
    reviewsCount: 5,
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Мурка',
    species: 'Кошка',
    breed: 'Мейн-кун',
    age: 2,
    gender: 'female',
    description: 'Крупная и величественная кошка. Очень общительная, любит компанию.',
    price: 5000,
    category: 'cats',
    tags: ['крупная', 'общительная', 'игривая'],
    available: false,
    rating: 5.0,
    reviewsCount: 31,
    image: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Гоша',
    species: 'Попугай',
    breed: 'Корелла',
    age: 3,
    gender: 'male',
    description: 'Говорящий попугай. Умеет петь и повторять слова. Очень дружелюбный.',
    price: 1200,
    category: 'birds',
    tags: ['говорящий', 'дружелюбный', 'умный'],
    available: true,
    rating: 4.8,
    reviewsCount: 14,
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Чарли',
    species: 'Собака',
    breed: 'Золотистый ретривер',
    age: 5,
    gender: 'male',
    description: 'Идеальная семейная собака. Добрый, терпеливый, обожает детей.',
    price: 4500,
    category: 'dogs',
    tags: ['семейный', 'добрый', 'терпеливый'],
    available: true,
    rating: 4.9,
    reviewsCount: 42,
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Снежок',
    species: 'Хомяк',
    breed: 'Джунгарский',
    age: 1,
    gender: 'male',
    description: 'Активный и забавный хомячок. Любит колесо и вкусняшки.',
    price: 300,
    category: 'rodents',
    tags: ['активный', 'забавный', 'ручной'],
    available: true,
    rating: 4.4,
    reviewsCount: 7,
    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Лиза',
    species: 'Кошка',
    breed: 'Абиссинская',
    age: 2,
    gender: 'female',
    description: 'Грациозная и умная кошечка. Очень привязчивая к хозяину.',
    price: 3000,
    category: 'cats',
    tags: ['грациозная', 'умная', 'привязчивая'],
    available: true,
    rating: 4.7,
    reviewsCount: 11,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Тузик',
    species: 'Собака',
    breed: 'Мопс',
    age: 2,
    gender: 'male',
    description: 'Веселый и компанейский мопс. Подходит для небольших квартир.',
    price: 3200,
    category: 'dogs',
    tags: ['весёлый', 'компанейский', 'квартирный'],
    available: true,
    rating: 4.6,
    reviewsCount: 16,
    image: 'https://images.unsplash.com/photo-1534361960057-19f4434ca9e7?w=600&q=80',
    createdAt: serverTimestamp()
  },
  {
    name: 'Кеша',
    species: 'Попугай',
    breed: 'Волнистый',
    age: 1,
    gender: 'male',
    description: 'Яркий волнистый попугай. Любит музыку и общение.',
    price: 600,
    category: 'birds',
    tags: ['яркий', 'весёлый', 'говорящий'],
    available: true,
    rating: 4.5,
    reviewsCount: 9,
    image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=600&q=80',
    createdAt: serverTimestamp()
  }
]

export async function seedDatabase() {
  console.log('Seeding database...')
  for (const animal of animals) {
    try {
      const docRef = await addDoc(collection(db, 'animals'), animal)
      console.log('Added:', animal.name, docRef.id)
    } catch (e) {
      console.error('Error adding:', animal.name, e)
    }
  }
  console.log('Seeding complete!')
}
