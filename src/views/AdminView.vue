<template>
  <div class="page">
    <div class="container">
      <div class="admin-header">
        <div>
          <h1 class="page-title">⚙️ Панель администратора</h1>
          <p class="page-subtitle">Управление питомником ZooHome</p>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="stats-bar">
        <div class="stat-card">
          <span class="stat-icon">🐾</span>
          <div>
            <div class="stat-num">{{ stats.animals }}</div>
            <div class="stat-label">Питомцев</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📅</span>
          <div>
            <div class="stat-num">{{ stats.bookings }}</div>
            <div class="stat-label">Записей</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">👥</span>
          <div>
            <div class="stat-num">{{ stats.users }}</div>
            <div class="stat-label">Пользователей</div>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">⭐</span>
          <div>
            <div class="stat-num">{{ stats.reviews }}</div>
            <div class="stat-label">Отзывов</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="admin-tabs">
        <button v-for="t in tabs" :key="t.key" :class="['admin-tab', { active: tab === t.key }]" @click="switchTab(t.key)">
          {{ t.icon }} {{ t.label }}
        </button>
      </div>

      <!-- Animals management -->
      <div v-if="tab === 'animals'" class="admin-panel">
        <div class="panel-toolbar">
          <h3>Питомцы</h3>
          <button class="btn btn-primary btn-sm" @click="openAnimalForm(null)">+ Добавить питомца</button>
        </div>

        <div v-if="loadingAnimals"><div class="spinner"></div></div>
        <div v-else class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Имя</th>
                <th>Порода</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Рейтинг</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in adminAnimals" :key="a.id">
                <td>
                  <img :src="a.image" class="table-img" :alt="a.name" @error="e => e.target.src = fallback" />
                </td>
                <td><strong>{{ a.name }}</strong></td>
                <td>{{ a.breed }}</td>
                <td>{{ catMap[a.category] || a.category }}</td>
                <td>{{ a.price?.toLocaleString() }} ₸</td>
                <td>{{ a.rating?.toFixed(1) }} ★ ({{ a.reviewsCount }})</td>
                <td>
                  <span :class="['badge', a.available ? 'badge-success' : 'badge-danger']">
                    {{ a.available ? 'Доступен' : 'Занят' }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm" @click="openAnimalForm(a)">✏️</button>
                    <button class="btn btn-danger btn-sm" @click="confirmDelete(a)">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bookings management -->
      <div v-else-if="tab === 'bookings'" class="admin-panel">
        <div class="panel-toolbar"><h3>Все записи</h3></div>
        <div v-if="loadingBookings"><div class="spinner"></div></div>
        <div v-else class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Питомец</th><th>Пользователь</th><th>Дата визита</th><th>Цена</th><th>Статус</th><th>Действия</th></tr>
            </thead>
            <tbody>
              <tr v-for="b in adminBookings" :key="b.id">
                <td><strong>{{ b.animalName }}</strong></td>
                <td>{{ b.userId?.slice(0, 8) }}…</td>
                <td>{{ formatDate(b.visitDate) }}</td>
                <td>{{ b.price?.toLocaleString() }} ₸</td>
                <td>
                  <span :class="['badge', statusClass(b.status)]">{{ statusLabel(b.status) }}</span>
                </td>
                <td>
                  <div class="table-actions">
                    <button v-if="b.status === 'pending'" class="btn btn-primary btn-sm" @click="confirmBooking(b.id)">✓ Подтвердить</button>
                    <button v-if="b.status === 'confirmed'" class="btn btn-secondary btn-sm" @click="completeBooking(b.id)">✔ Завершить</button>
                    <button v-if="['pending','confirmed'].includes(b.status)" class="btn btn-danger btn-sm" @click="cancelBookingAdmin(b.id)">✗</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Users management -->
      <div v-else-if="tab === 'users'" class="admin-panel">
        <div class="panel-toolbar"><h3>Пользователи</h3></div>
        <div v-if="loadingUsers"><div class="spinner"></div></div>
        <div v-else class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Имя</th><th>Email</th><th>Роль</th><th>Дата регистрации</th><th>Действия</th></tr>
            </thead>
            <tbody>
              <tr v-for="u in adminUsers" :key="u.id">
                <td><strong>{{ u.displayName || '—' }}</strong></td>
                <td>{{ u.email }}</td>
                <td>
                  <span :class="['badge', u.role === 'admin' ? 'badge-warning' : 'badge-info']">
                    {{ u.role === 'admin' ? '👑 Admin' : '👤 User' }}
                  </span>
                </td>
                <td>{{ formatDate(u.createdAt?.toDate?.()?.toISOString?.()?.split('T')[0] || '') }}</td>
                <td>
                  <div class="table-actions">
                    <button v-if="u.role !== 'admin'" class="btn btn-secondary btn-sm" @click="makeAdmin(u)">Назначить админом</button>
                    <button v-else class="btn btn-ghost btn-sm" @click="removeAdmin(u)">Убрать права</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reviews moderation -->
      <div v-else-if="tab === 'reviews'" class="admin-panel">
        <div class="panel-toolbar"><h3>Все отзывы</h3></div>
        <div v-if="loadingReviews"><div class="spinner"></div></div>
        <div v-else class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Автор</th><th>Питомец</th><th>Оценка</th><th>Текст</th><th>Действия</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in adminReviews" :key="r.id">
                <td>{{ r.userName }}</td>
                <td>{{ r.animalId?.slice(0, 8) }}</td>
                <td>{{ r.rating }} ★</td>
                <td class="review-text-cell">{{ r.text?.slice(0, 80) }}{{ r.text?.length > 80 ? '…' : '' }}</td>
                <td>
                  <button class="btn btn-danger btn-sm" @click="deleteReviewAdmin(r)">🗑 Удалить</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Animal form modal -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">{{ editingAnimal ? 'Редактировать питомца' : 'Добавить питомца' }}</h2>
            <button class="modal-close" @click="showForm = false">✕</button>
          </div>

          <form @submit.prevent="saveAnimal" class="animal-form">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Имя *</label>
                <input v-model="animalForm.name" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Вид *</label>
                <input v-model="animalForm.species" class="form-input" placeholder="Кот, Собака…" required />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Порода *</label>
                <input v-model="animalForm.breed" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Категория *</label>
                <select v-model="animalForm.category" class="form-select" required>
                  <option value="cats">Кошки</option>
                  <option value="dogs">Собаки</option>
                  <option value="birds">Птицы</option>
                  <option value="rodents">Грызуны</option>
                  <option value="other">Другие</option>
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Возраст (лет)</label>
                <input v-model.number="animalForm.age" class="form-input" type="number" min="0" max="30" />
              </div>
              <div class="form-group">
                <label class="form-label">Пол</label>
                <select v-model="animalForm.gender" class="form-select">
                  <option value="male">Мальчик</option>
                  <option value="female">Девочка</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Стоимость визита (₸) *</label>
              <input v-model.number="animalForm.price" class="form-input" type="number" min="0" required />
            </div>
            <div class="form-group">
              <label class="form-label">URL фото</label>
              <input v-model="animalForm.image" class="form-input" type="url" placeholder="https://…" />
            </div>
            <div class="form-group">
              <label class="form-label">Описание *</label>
              <textarea v-model="animalForm.description" class="form-textarea" rows="3" required />
            </div>
            <div class="form-group">
              <label class="form-label">Теги (через запятую)</label>
              <input v-model="tagsInput" class="form-input" placeholder="ласковый, игривый, привит" />
            </div>
            <div class="form-check">
              <input v-model="animalForm.available" type="checkbox" id="avail" />
              <label for="avail">Доступен для записи</label>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-ghost" @click="showForm = false">Отмена</button>
              <button type="submit" class="btn btn-primary" :disabled="formLoading">
                {{ formLoading ? 'Сохраняем…' : (editingAnimal ? 'Сохранить' : 'Добавить') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal" style="max-width: 400px;">
          <div class="modal-header">
            <h2 class="modal-title">Удалить питомца?</h2>
            <button class="modal-close" @click="deleteTarget = null">✕</button>
          </div>
          <p style="margin-bottom: 24px; color: var(--stone);">
            Вы уверены, что хотите удалить <strong>{{ deleteTarget.name }}</strong>? Это действие нельзя отменить.
          </p>
          <div class="form-actions">
            <button class="btn btn-ghost" @click="deleteTarget = null">Отмена</button>
            <button class="btn btn-danger" @click="doDelete">Удалить</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, query, orderBy, doc, setDoc, updateDoc, getCountFromServer } from 'firebase/firestore'
import { db } from '@/firebase/config.js'
import { useAnimalsStore } from '@/store/animals.js'
import { useBookingsStore } from '@/store/bookings.js'
import { useReviewsStore } from '@/store/reviews.js'
import { useToast } from '@/composables/useToast.js'

const animalsStore = useAnimalsStore()
const bookingsStore = useBookingsStore()
const reviewsStore = useReviewsStore()
const { success, error } = useToast()

const tab = ref('animals')
const tabs = [
  { key: 'animals', icon: '🐾', label: 'Питомцы' },
  { key: 'bookings', icon: '📅', label: 'Записи' },
  { key: 'users', icon: '👥', label: 'Пользователи' },
  { key: 'reviews', icon: '⭐', label: 'Отзывы' }
]

const stats = ref({ animals: 0, bookings: 0, users: 0, reviews: 0 })
const adminAnimals = ref([])
const adminBookings = ref([])
const adminUsers = ref([])
const adminReviews = ref([])

const loadingAnimals = ref(false)
const loadingBookings = ref(false)
const loadingUsers = ref(false)
const loadingReviews = ref(false)

const showForm = ref(false)
const editingAnimal = ref(null)
const formLoading = ref(false)
const deleteTarget = ref(null)
const tagsInput = ref('')

const fallback = 'https://images.unsplash.com/photo-1548681528-6a5c45b66063?w=100&q=60'

const catMap = { cats: '🐱 Кошки', dogs: '🐶 Собаки', birds: '🦜 Птицы', rodents: '🐹 Грызуны', other: '🐾 Другие' }

const defaultForm = () => ({
  name: '', species: '', breed: '', category: 'cats',
  age: 1, gender: 'male', price: 1000,
  image: '', description: '', available: true
})
const animalForm = ref(defaultForm())

const statusLabels = { pending: 'Ожидает', confirmed: 'Подтверждено', completed: 'Завершено', cancelled: 'Отменено' }
const statusClasses = { pending: 'badge-warning', confirmed: 'badge-success', completed: 'badge-info', cancelled: 'badge-danger' }
function statusLabel(s) { return statusLabels[s] || s }
function statusClass(s) { return statusClasses[s] || '' }

function formatDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return d }
}

async function loadStats() {
  const cols = ['animals', 'bookings', 'users', 'reviews']
  await Promise.all(cols.map(async col => {
    try {
      const snap = await getCountFromServer(collection(db, col))
      stats.value[col] = snap.data().count
    } catch { stats.value[col] = '—' }
  }))
}

async function loadAnimals() {
  loadingAnimals.value = true
  try {
    const q = query(collection(db, 'animals'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    adminAnimals.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } finally { loadingAnimals.value = false }
}

async function switchTab(key) {
  tab.value = key
  if (key === 'animals' && !adminAnimals.value.length) loadAnimals()
  if (key === 'bookings' && !adminBookings.value.length) {
    loadingBookings.value = true
    adminBookings.value = await bookingsStore.fetchAllBookings()
    loadingBookings.value = false
  }
  if (key === 'users' && !adminUsers.value.length) {
    loadingUsers.value = true
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
    adminUsers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    loadingUsers.value = false
  }
  if (key === 'reviews' && !adminReviews.value.length) {
    loadingReviews.value = true
    adminReviews.value = await reviewsStore.fetchAllReviews()
    loadingReviews.value = false
  }
}

function openAnimalForm(animal) {
  editingAnimal.value = animal
  if (animal) {
    animalForm.value = { ...animal }
    tagsInput.value = (animal.tags || []).join(', ')
  } else {
    animalForm.value = defaultForm()
    tagsInput.value = ''
  }
  showForm.value = true
}

async function saveAnimal() {
  formLoading.value = true
  try {
    const data = {
      ...animalForm.value,
      tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
    }
    if (editingAnimal.value) {
      await animalsStore.updateAnimal(editingAnimal.value.id, data)
      const idx = adminAnimals.value.findIndex(a => a.id === editingAnimal.value.id)
      if (idx !== -1) adminAnimals.value[idx] = { ...adminAnimals.value[idx], ...data }
      success('Питомец обновлён!')
    } else {
      const ref = await animalsStore.addAnimal(data)
      adminAnimals.value.unshift({ id: ref.id, ...data, rating: 0, reviewsCount: 0 })
      stats.value.animals++
      success('Питомец добавлен!')
    }
    showForm.value = false
  } catch (e) { error('Ошибка при сохранении') }
  finally { formLoading.value = false }
}

function confirmDelete(animal) { deleteTarget.value = animal }
async function doDelete() {
  try {
    await animalsStore.deleteAnimal(deleteTarget.value.id)
    adminAnimals.value = adminAnimals.value.filter(a => a.id !== deleteTarget.value.id)
    stats.value.animals--
    success('Питомец удалён')
    deleteTarget.value = null
  } catch { error('Ошибка при удалении') }
}

async function confirmBooking(id) {
  await bookingsStore.confirmBooking(id)
  const b = adminBookings.value.find(b => b.id === id)
  if (b) b.status = 'confirmed'
  success('Запись подтверждена')
}
async function completeBooking(id) {
  await bookingsStore.completeBooking(id)
  const b = adminBookings.value.find(b => b.id === id)
  if (b) b.status = 'completed'
  success('Запись завершена')
}
async function cancelBookingAdmin(id) {
  await bookingsStore.cancelBooking(id)
  const b = adminBookings.value.find(b => b.id === id)
  if (b) b.status = 'cancelled'
  success('Запись отменена')
}

async function makeAdmin(u) {
  await setDoc(doc(db, 'users', u.id), { role: 'admin' }, { merge: true })
  u.role = 'admin'
  success(`${u.displayName || u.email} теперь администратор`)
}
async function removeAdmin(u) {
  await setDoc(doc(db, 'users', u.id), { role: 'user' }, { merge: true })
  u.role = 'user'
  success('Права сняты')
}

async function deleteReviewAdmin(r) {
  await reviewsStore.deleteReview(r.id, r.animalId, r.rating)
  adminReviews.value = adminReviews.value.filter(x => x.id !== r.id)
  stats.value.reviews--
  success('Отзыв удалён')
}

onMounted(async () => {
  await loadStats()
  await loadAnimals()
})
</script>

<style scoped>
.admin-header { margin-bottom: 28px; }

.stats-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1.5px solid var(--parchment);
  box-shadow: var(--shadow-sm);
}
.stat-icon { font-size: 32px; }
.stat-num { font-size: 28px; font-weight: 700; color: var(--forest); font-family: var(--font-display); }
.stat-label { font-size: 13px; color: var(--stone); }

.admin-tabs {
  display: flex;
  gap: 4px;
  background: var(--parchment);
  padding: 4px;
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.admin-tab {
  flex: 1;
  padding: 10px 16px;
  border: none; background: transparent;
  border-radius: var(--radius-md);
  font-size: 14px; font-weight: 500;
  color: var(--stone);
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}
.admin-tab:hover { color: var(--forest); }
.admin-tab.active { background: white; color: var(--charcoal); box-shadow: var(--shadow-sm); }

.admin-panel {
  background: white;
  border-radius: var(--radius-xl);
  padding: 28px;
  border: 1.5px solid var(--parchment);
}
.panel-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.panel-toolbar h3 { font-size: 20px; }

.admin-table-wrap { overflow-x: auto; }
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.admin-table th {
  text-align: left;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--stone);
  border-bottom: 2px solid var(--parchment);
  white-space: nowrap;
}
.admin-table td {
  padding: 12px;
  border-bottom: 1px solid var(--parchment);
  vertical-align: middle;
}
.admin-table tr:hover td { background: var(--warm-white); }
.admin-table tr:last-child td { border-bottom: none; }

.table-img {
  width: 48px; height: 48px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.table-actions { display: flex; gap: 6px; align-items: center; }
.review-text-cell { max-width: 240px; color: var(--stone); }

/* Form modal */
.animal-form { display: flex; flex-direction: column; gap: 16px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-check {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px;
}
.form-check input { width: 16px; height: 16px; accent-color: var(--forest); }
.form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }

@media (max-width: 900px) {
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .stats-bar { grid-template-columns: 1fr 1fr; }
  .form-row-2 { grid-template-columns: 1fr; }
  .admin-tab { font-size: 12px; padding: 8px 10px; }
}
</style>
