<template>
  <div class="page">
    <div class="container">
      <h1 class="page-title">Личный кабинет</h1>

      <div class="profile-layout">
        <!-- Sidebar -->
        <aside class="profile-sidebar">
          <div class="profile-avatar-block">
            <div class="big-avatar">{{ initials }}</div>
            <h2 class="profile-name">{{ auth.displayName }}</h2>
            <p class="profile-email">{{ auth.user?.email }}</p>
            <span v-if="auth.isAdmin" class="badge badge-warning">👑 Администратор</span>
          </div>

          <nav class="profile-nav">
            <button :class="['prof-nav-btn', { active: section === 'info' }]" @click="section = 'info'">
              👤 Профиль
            </button>
            <button :class="['prof-nav-btn', { active: section === 'bookings' }]" @click="loadBookings">
              📅 Мои записи
            </button>
            <button :class="['prof-nav-btn', { active: section === 'reviews' }]" @click="loadReviews">
              ⭐ Мои отзывы
            </button>
          </nav>
        </aside>

        <!-- Content -->
        <main class="profile-content">
          <!-- Profile info -->
          <div v-if="section === 'info'" class="section-card">
            <h3 class="section-card-title">Личные данные</h3>

            <div v-if="saved" class="alert alert-success">Профиль сохранён!</div>

            <form @submit.prevent="saveProfile" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Имя</label>
                  <input v-model="form.displayName" class="form-input" type="text" />
                </div>
                <div class="form-group">
                  <label class="form-label">Телефон</label>
                  <input v-model="form.phone" class="form-input" type="tel" placeholder="+7 777 000 00 00" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">О себе</label>
                <textarea v-model="form.bio" class="form-textarea" rows="3" placeholder="Расскажите о себе…" />
              </div>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Сохраняем…' : 'Сохранить изменения' }}
              </button>
            </form>
          </div>

          <!-- Bookings history -->
          <div v-else-if="section === 'bookings'" class="section-card">
            <h3 class="section-card-title">История записей</h3>
            <div v-if="loadingData"><div class="spinner"></div></div>
            <div v-else-if="allBookings.length === 0" class="empty-state" style="padding: 40px;">
              <div class="empty-state-icon" style="font-size: 40px;">📅</div>
              <p>У вас пока нет записей</p>
              <RouterLink to="/" class="btn btn-primary btn-sm">Записаться</RouterLink>
            </div>
            <div v-else class="bookings-list">
              <BookingCard
                v-for="b in allBookings"
                :key="b.id"
                :booking="b"
                :read-only="true"
              />
            </div>
          </div>

          <!-- Reviews -->
          <div v-else-if="section === 'reviews'" class="section-card">
            <h3 class="section-card-title">Мои отзывы</h3>
            <div v-if="loadingData"><div class="spinner"></div></div>
            <div v-else-if="myReviews.length === 0" class="empty-state" style="padding: 40px;">
              <div class="empty-state-icon" style="font-size: 40px;">⭐</div>
              <p>Вы ещё не оставили отзывов</p>
            </div>
            <div v-else class="reviews-list">
              <div v-for="review in myReviews" :key="review.id" class="my-review-card">
                <div class="my-review-header">
                  <strong>{{ review.animalName || 'Питомец' }}</strong>
                  <StarsDisplay :rating="review.rating" />
                  <button class="delete-btn" @click="deleteReview(review)">🗑 Удалить</button>
                </div>
                <p>{{ review.text }}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config.js'
import { useAuthStore } from '@/store/auth.js'
import { useReviewsStore } from '@/store/reviews.js'
import { useToast } from '@/composables/useToast.js'
import BookingCard from '@/components/bookings/BookingCard.vue'
import StarsDisplay from '@/components/ui/StarsDisplay.vue'

const auth = useAuthStore()
const reviewsStore = useReviewsStore()
const { success, error } = useToast()

const section = ref('info')
const saving = ref(false)
const saved = ref(false)
const loadingData = ref(false)
const allBookings = ref([])
const myReviews = ref([])

const form = ref({
  displayName: auth.userProfile?.displayName || '',
  phone: auth.userProfile?.phone || '',
  bio: auth.userProfile?.bio || ''
})

const initials = computed(() => {
  const n = auth.displayName
  if (!n) return '?'
  return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
})

async function saveProfile() {
  saving.value = true
  saved.value = false
  try {
    await auth.updateUserProfile(form.value)
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
    success('Профиль сохранён!')
  } catch { error('Ошибка при сохранении') }
  finally { saving.value = false }
}

async function loadBookings() {
  section.value = 'bookings'
  loadingData.value = true
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', auth.user.uid),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    allBookings.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } finally { loadingData.value = false }
}

async function loadReviews() {
  section.value = 'reviews'
  loadingData.value = true
  try {
    const reviews = await reviewsStore.fetchUserReviews(auth.user.uid)
    // Enrich with animal names
    const enriched = await Promise.all(reviews.map(async r => {
      try {
        const { getDoc, doc } = await import('firebase/firestore')
        const snap = await getDoc(doc(db, 'animals', r.animalId))
        return { ...r, animalName: snap.data()?.name || 'Питомец' }
      } catch { return r }
    }))
    myReviews.value = enriched
  } finally { loadingData.value = false }
}

async function deleteReview(review) {
  try {
    await reviewsStore.deleteReview(review.id, review.animalId, review.rating)
    myReviews.value = myReviews.value.filter(r => r.id !== review.id)
    success('Отзыв удалён')
  } catch { error('Ошибка при удалении') }
}

onMounted(() => {
  form.value = {
    displayName: auth.userProfile?.displayName || '',
    phone: auth.userProfile?.phone || '',
    bio: auth.userProfile?.bio || ''
  }
})
</script>

<style scoped>
.profile-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  align-items: flex-start;
}

.profile-sidebar {
  position: sticky;
  top: 90px;
}

.profile-avatar-block {
  background: white;
  border-radius: var(--radius-xl);
  padding: 28px;
  text-align: center;
  margin-bottom: 16px;
  border: 1.5px solid var(--parchment);
}
.big-avatar {
  width: 72px; height: 72px;
  background: var(--forest);
  color: white;
  border-radius: 50%;
  font-size: 24px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.profile-name { font-size: 18px; margin-bottom: 4px; }
.profile-email { font-size: 13px; color: var(--stone); margin-bottom: 12px; }

.profile-nav {
  background: white;
  border-radius: var(--radius-xl);
  padding: 8px;
  border: 1.5px solid var(--parchment);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prof-nav-btn {
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--stone);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
}
.prof-nav-btn:hover, .prof-nav-btn.active {
  background: rgba(61, 90, 62, 0.08);
  color: var(--forest);
}

.section-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 32px;
  border: 1.5px solid var(--parchment);
}
.section-card-title {
  font-size: 22px;
  margin-bottom: 24px;
}

.profile-form { display: flex; flex-direction: column; gap: 18px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.bookings-list, .reviews-list { display: flex; flex-direction: column; gap: 16px; }

.my-review-card {
  background: var(--parchment);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
}
.my-review-header {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 10px; flex-wrap: wrap;
}
.my-review-header strong { font-size: 15px; }
.delete-btn {
  margin-left: auto; background: transparent; border: none;
  color: var(--rust); font-size: 13px; cursor: pointer;
}

@media (max-width: 900px) {
  .profile-layout { grid-template-columns: 1fr; }
  .profile-sidebar { position: static; }
  .profile-avatar-block { display: flex; align-items: center; gap: 20px; text-align: left; }
  .big-avatar { margin: 0; flex-shrink: 0; }
}
@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; }
  .profile-avatar-block { flex-direction: column; text-align: center; }
  .big-avatar { margin: 0 auto; }
}
</style>
