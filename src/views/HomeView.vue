<template>
  <div>
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="container hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Найдите своего <em>идеального</em> питомца</h1>
          <p class="hero-sub">Более {{ totalAnimals }}+ животных ждут своего нового дома. Запишитесь на знакомство уже сегодня.</p>
        </div>
        <div class="hero-search">
          <span class="search-icon">🔍</span>
          <input
            v-model="search"
            type="text"
            placeholder="Поиск по имени, породе, описанию…"
            class="search-input"
            @input="debouncedFetch"
          />
          <button v-if="search" class="search-clear" @click="clearSearch">✕</button>
        </div>
      </div>
    </section>

    <Transition name="fade">
      <div v-if="newAnimalNotice" class="realtime-notice container">
        🐾 Только что добавлен новый питомец — <strong>{{ newAnimalNotice }}</strong>!
        <button @click="newAnimalNotice = null">✕</button>
      </div>
    </Transition>

    <div class="container page-body">
      <aside class="filters-panel">
        <h3 class="filters-title">Фильтры</h3>

        <div class="filter-group">
          <label class="filter-label">Категория</label>
          <div class="category-pills">
            <button
              v-for="cat in categories"
              :key="cat.value"
              class="cat-pill"
              :class="{ active: filters.category === cat.value }"
              @click="setCategory(cat.value)"
            >{{ cat.icon }} {{ cat.label }}</button>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-label">Пол</label>
          <select v-model="filters.gender" class="form-select" @change="applyFilters">
            <option value="all">Любой</option>
            <option value="male">Мальчик</option>
            <option value="female">Девочка</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Доступность</label>
          <select v-model="filters.available" class="form-select" @change="applyFilters">
            <option value="all">Все</option>
            <option value="true">Доступны</option>
            <option value="false">Заняты</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Сортировка</label>
          <select v-model="filters.sortBy" class="form-select" @change="applyFilters">
            <option value="createdAt">Новые</option>
            <option value="price_asc">Цена: ↑</option>
            <option value="price_desc">Цена: ↓</option>
            <option value="rating">Рейтинг</option>
            <option value="age">Возраст</option>
          </select>
        </div>

        <button class="btn btn-outline btn-sm reset-btn" @click="resetFilters">Сбросить</button>
      </aside>

      <main class="catalog-main">
        <div v-if="hasActiveFilters" class="active-filters">
          <span v-if="search" class="filter-chip">
            🔍 "{{ search }}" <button @click="clearSearch">✕</button>
          </span>
          <span v-if="filters.category !== 'all'" class="filter-chip">
            {{ activeCatLabel }} <button @click="setCategory('all')">✕</button>
          </span>
        </div>

        <div v-if="store.loading && store.animals.length === 0">
          <div class="spinner"></div>
        </div>

        <div v-else-if="!store.loading && store.animals.length === 0" class="empty-state">
          <div class="empty-state-icon">🐾</div>
          <h3>Питомцы не найдены</h3>
          <p>Попробуйте изменить параметры поиска</p>
          <button class="btn btn-primary" @click="resetFilters">Сбросить фильтры</button>
        </div>

        <TransitionGroup v-else name="slide-up" tag="div" class="grid-3">
          <AnimalCard v-for="animal in store.animals" :key="animal.id" :animal="animal" />
        </TransitionGroup>

        <div v-if="store.hasMore && store.animals.length > 0" class="load-more-wrap">
          <button
            class="btn btn-outline btn-lg"
            :disabled="store.loading"
            @click="loadMore"
          >
            <span v-if="store.loading">Загрузка…</span>
            <span v-else>Показать ещё</span>
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAnimalsStore } from '@/store/animals.js'
import AnimalCard from '@/components/animals/AnimalCard.vue'

const store = useAnimalsStore()

const search = ref('')
const newAnimalNotice = ref(null)
const totalAnimals = computed(() => store.total)

const filters = ref({
  category: 'all',
  gender: 'all',
  available: 'all',
  sortBy: 'createdAt'
})

const categories = [
  { value: 'all', label: 'Все', icon: '🐾' },
  { value: 'cats', label: 'Кошки', icon: '🐱' },
  { value: 'dogs', label: 'Собаки', icon: '🐶' },
  { value: 'birds', label: 'Птицы', icon: '🦜' },
  { value: 'rodents', label: 'Грызуны', icon: '🐹' },
]

const hasActiveFilters = computed(() =>
  search.value || filters.value.category !== 'all'
)

const activeCatLabel = computed(() =>
  categories.find(c => c.value === filters.value.category)?.label || ''
)

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(applyFilters, 400)
}

function applyFilters() {
  store.fetchAnimals({ ...filters.value, search: search.value })
}

function setCategory(val) {
  filters.value.category = val
  applyFilters()
}

function resetFilters() {
  search.value = ''
  filters.value = { category: 'all', gender: 'all', available: 'all', sortBy: 'createdAt' }
  applyFilters()
}

function clearSearch() {
  search.value = ''
  applyFilters()
}

function loadMore() {
  store.loadMore({ ...filters.value, search: search.value })
}

let unsub = null
onMounted(() => {
  applyFilters()
  unsub = store.subscribeToAnimals((newAnimal) => {
    newAnimalNotice.value = newAnimal.name
    setTimeout(() => { newAnimalNotice.value = null }, 5000)
  })
})

onUnmounted(() => {
  store.stopSubscription()
  clearTimeout(debounceTimer)
})
</script>

<style scoped>
.hero {
  position: relative;
  background: var(--charcoal);
  padding: 80px 0 60px;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  background: url('https://images.unsplash.com/photo-1415369629372-26f2fe0553b0?w=1600&q=60') center/cover no-repeat;
  opacity: 0.25;
}
.hero-content { position: relative; z-index: 1; }
.hero-text { margin-bottom: 32px; }
.hero-title {
  font-size: clamp(32px, 6vw, 64px);
  color: white;
  margin-bottom: 16px;
  line-height: 1.15;
}
.hero-title em { color: var(--moss); font-style: italic; }
.hero-sub { color: rgba(255,255,255,0.75); font-size: 18px; max-width: 540px; }

.hero-search {
  display: flex;
  align-items: center;
  background: white;
  border-radius: var(--radius-xl);
  padding: 6px 6px 6px 20px;
  max-width: 600px;
  box-shadow: var(--shadow-lg);
}
.search-icon { font-size: 18px; margin-right: 8px; }
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: var(--charcoal);
  padding: 10px 0;
}
.search-clear {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--mist);
  cursor: pointer;
  font-size: 14px;
}

.realtime-notice {
  background: var(--forest);
  color: white;
  padding: 12px 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  margin-top: -1px;
}
.realtime-notice button {
  margin-left: auto;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  font-size: 16px;
}

.page-body {
  display: flex;
  gap: 32px;
  padding-top: 40px;
  padding-bottom: 80px;
  align-items: flex-start;
}

.filters-panel {
  width: 220px;
  flex-shrink: 0;
  position: sticky;
  top: 90px;
}
.filters-title {
  font-size: 18px;
  margin-bottom: 20px;
  color: var(--charcoal);
}
.filter-group { margin-bottom: 20px; }
.filter-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--stone);
  margin-bottom: 10px;
}
.category-pills { display: flex; flex-direction: column; gap: 6px; }
.cat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--parchment);
  background: white;
  font-size: 14px;
  color: var(--stone);
  cursor: pointer;
  transition: all var(--transition);
  text-align: left;
}
.cat-pill:hover { border-color: var(--moss); color: var(--forest); }
.cat-pill.active { border-color: var(--forest); background: rgba(61, 90, 62, 0.08); color: var(--forest); font-weight: 500; }
.reset-btn { width: 100%; justify-content: center; margin-top: 8px; }

.catalog-main { flex: 1; min-width: 0; }

.active-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(61, 90, 62, 0.1);
  color: var(--forest);
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
}
.filter-chip button {
  background: transparent;
  border: none;
  color: var(--forest);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  line-height: 1;
}

.load-more-wrap { text-align: center; margin-top: 40px; }

@media (max-width: 900px) {
  .page-body { flex-direction: column; }
  .filters-panel {
    width: 100%;
    position: static;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
  }
  .filters-title { width: 100%; margin-bottom: 0; }
  .filter-group { margin-bottom: 0; min-width: 140px; flex: 1; }
  .category-pills { flex-direction: row; flex-wrap: wrap; }
}
</style>
