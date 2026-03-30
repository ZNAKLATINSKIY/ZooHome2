<template>
  <div class="page">
    <div v-if="loading" class="container"><div class="spinner"></div></div>

    <div v-else-if="!animal" class="container empty-state">
      <div class="empty-state-icon">🐾</div>
      <h3>Питомец не найден</h3>
      <RouterLink to="/" class="btn btn-primary">На главную</RouterLink>
    </div>

    <template v-else>
      <div class="container back-row">
        <RouterLink to="/" class="back-link">← Все питомцы</RouterLink>
      </div>

      <div class="container animal-hero">
        <div class="animal-gallery">
          <img
            :src="animal.image || fallback"
            :alt="animal.name"
            class="main-img"
            @error="e => e.target.src = fallback"
          />
          <div class="gallery-badges">
            <span class="badge badge-info">{{ animal.species }}</span>
            <span :class="['badge', animal.available ? 'badge-success' : 'badge-danger']">
              {{ animal.available ? '✓ Доступен' : '✗ Занят' }}
            </span>
          </div>
        </div>

        <div class="animal-info">
          <h1 class="animal-title">{{ animal.name }}</h1>
          <p class="animal-breed-line">{{ animal.species }} · {{ animal.breed }}</p>

          <div class="rating-row">
            <StarsDisplay :rating="animal.rating" :show-number="true" />
            <span class="reviews-link" @click="scrollToReviews">{{ animal.reviewsCount || 0 }} отзывов</span>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-icon">🎂</span>
              <div>
                <div class="detail-label">Возраст</div>
                <div class="detail-val">{{ ageText }}</div>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-icon">{{ animal.gender === 'male' ? '♂️' : '♀️' }}</span>
              <div>
                <div class="detail-label">Пол</div>
                <div class="detail-val">{{ animal.gender === 'male' ? 'Мальчик' : 'Девочка' }}</div>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-icon">💰</span>
              <div>
                <div class="detail-label">Стоимость визита</div>
                <div class="detail-val price-val">{{ formatPrice(animal.price) }} ₸</div>
              </div>
            </div>
          </div>

          <p class="animal-description">{{ animal.description }}</p>

          <div v-if="animal.tags?.length" class="tags-row">
            <span v-for="tag in animal.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <div class="booking-box">
            <h3 class="booking-title">Записаться на знакомство</h3>

            <div v-if="!auth.isLoggedIn" class="booking-auth-note">
              <RouterLink to="/login" class="btn btn-primary">Войдите</RouterLink>
              чтобы записаться
            </div>

            <div v-else-if="!animal.available" class="booking-unavail">
              Этот питомец сейчас занят. Загляните позже!
            </div>

            <form v-else @submit.prevent="submitBooking" class="booking-form">
              <div class="form-group">
                <label class="form-label">Дата визита</label>
                <input
                  v-model="bookingDate"
                  type="date"
                  class="form-input"
                  :min="minDate"
                  required
                />
              </div>
              <div class="form-group">
                <label class="form-label">Примечание (необязательно)</label>
                <textarea v-model="bookingNote" class="form-textarea" rows="2" placeholder="Ваши пожелания…" />
              </div>
              <button
                type="submit"
                class="btn btn-primary btn-lg booking-submit"
                :disabled="bookingLoading"
              >
                {{ bookingLoading ? 'Бронируем…' : '🐾 Записаться' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="container reviews-section" ref="reviewsRef">
        <div class="section-heading">
          <h2>Отзывы</h2>
          <div class="section-heading-line"></div>
        </div>

        <div v-if="auth.isLoggedIn && !userHasReview" class="add-review-box">
          <h4>Оставить отзыв</h4>
          <StarRating v-model="newRating" />
          <textarea
            v-model="newReviewText"
            class="form-textarea"
            placeholder="Поделитесь впечатлениями…"
            rows="3"
          />
          <button
            class="btn btn-primary btn-sm"
            :disabled="!newRating || !newReviewText.trim() || reviewLoading"
            @click="submitReview"
          >{{ reviewLoading ? 'Отправка…' : 'Отправить отзыв' }}</button>
        </div>

        <div v-if="reviewsStore.loading"><div class="spinner"></div></div>
        <div v-else-if="reviewsStore.reviews.length === 0" class="empty-state" style="padding: 40px;">
          <div class="empty-state-icon" style="font-size: 40px;">💬</div>
          <p>Отзывов пока нет. Будьте первым!</p>
        </div>
        <TransitionGroup v-else name="slide-up" tag="div" class="reviews-list">
          <ReviewCard
            v-for="review in reviewsStore.reviews"
            :key="review.id"
            :review="review"
            :can-delete="auth.user?.uid === review.userId || auth.isAdmin"
            @delete="deleteReview(review)"
          />
        </TransitionGroup>
      </div>

      <div v-if="related.length" class="container related-section">
        <div class="section-heading">
          <h2>Похожие питомцы</h2>
          <div class="section-heading-line"></div>
        </div>
        <div class="grid-3">
          <AnimalCard v-for="a in related" :key="a.id" :animal="a" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase/config.js'
import { useAnimalsStore } from '@/store/animals.js'
import { useBookingsStore } from '@/store/bookings.js'
import { useReviewsStore } from '@/store/reviews.js'
import { useAuthStore } from '@/store/auth.js'
import { useToast } from '@/composables/useToast.js'
import StarsDisplay from '@/components/ui/StarsDisplay.vue'
import StarRating from '@/components/ui/StarRating.vue'
import AnimalCard from '@/components/animals/AnimalCard.vue'
import ReviewCard from '@/components/animals/ReviewCard.vue'

const route = useRoute()
const animalsStore = useAnimalsStore()
const bookingsStore = useBookingsStore()
const reviewsStore = useReviewsStore()
const auth = useAuthStore()
const { success, error } = useToast()

const animal = ref(null)
const loading = ref(true)
const related = ref([])
const reviewsRef = ref(null)

const bookingDate = ref('')
const bookingNote = ref('')
const bookingLoading = ref(false)

const newRating = ref(0)
const newReviewText = ref('')
const reviewLoading = ref(false)

const fallback = 'https://images.unsplash.com/photo-1548681528-6a5c45b66063?w=800&q=80'

const minDate = computed(() => new Date().toISOString().split('T')[0])

const ageText = computed(() => {
  const a = animal.value?.age
  if (!a) return '—'
  if (a === 1) return '1 год'
  if (a < 5) return `${a} года`
  return `${a} лет`
})

const userHasReview = computed(() =>
  reviewsStore.reviews.some(r => r.userId === auth.user?.uid)
)

function formatPrice(p) { return p?.toLocaleString('ru-RU') || '0' }

function scrollToReviews() {
  reviewsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function loadRelated() {
  if (!animal.value) return
  const q = query(
    collection(db, 'animals'),
    where('category', '==', animal.value.category),
    orderBy('rating', 'desc'),
    limit(4)
  )
  const snap = await getDocs(q)
  related.value = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(a => a.id !== animal.value.id)
    .slice(0, 3)
}

async function submitBooking() {
  if (!bookingDate.value) return
  bookingLoading.value = true
  try {
    await bookingsStore.createBooking(auth.user.uid, animal.value, bookingDate.value, bookingNote.value)
    bookingDate.value = ''
    bookingNote.value = ''
    success('Запись создана! Ждём вас 🐾')
  } catch (e) {
    error('Ошибка при создании записи')
  } finally {
    bookingLoading.value = false
  }
}

async function submitReview() {
  if (!newRating.value || !newReviewText.value.trim()) return
  reviewLoading.value = true
  try {
    await reviewsStore.addReview(
      auth.user.uid,
      auth.displayName,
      animal.value.id,
      newRating.value,
      newReviewText.value.trim()
    )
    newRating.value = 0
    newReviewText.value = ''
    success('Отзыв добавлен!')
  } catch (e) {
    error('Ошибка при добавлении отзыва')
  } finally {
    reviewLoading.value = false
  }
}

async function deleteReview(review) {
  try {
    await reviewsStore.deleteReview(review.id, animal.value.id, review.rating)
    success('Отзыв удалён')
  } catch (e) {
    error('Ошибка при удалении')
  }
}

async function load() {
  loading.value = true
  try {
    animal.value = await animalsStore.getAnimal(route.params.id)
    if (animal.value) {
      await Promise.all([
        reviewsStore.fetchReviews(animal.value.id),
        loadRelated()
      ])
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => route.params.id, load)
</script>

<style scoped>
.back-row { padding-top: 24px; margin-bottom: 24px; }
.back-link { color: var(--stone); font-size: 14px; transition: color var(--transition); }
.back-link:hover { color: var(--forest); }

.animal-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: flex-start;
  margin-bottom: 60px;
}

.animal-gallery { position: relative; }
.main-img {
  width: 100%;
  height: 480px;
  object-fit: cover;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}
.gallery-badges {
  position: absolute;
  top: 16px; left: 16px;
  display: flex; gap: 8px;
}

.animal-title {
  font-size: clamp(28px, 4vw, 42px);
  margin-bottom: 6px;
}
.animal-breed-line { color: var(--stone); font-size: 16px; margin-bottom: 16px; }
.rating-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.reviews-link { color: var(--caramel); font-size: 14px; cursor: pointer; text-decoration: underline; }

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background: var(--parchment);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 24px;
}
.detail-item { display: flex; align-items: center; gap: 10px; }
.detail-icon { font-size: 22px; }
.detail-label { font-size: 11px; color: var(--mist); text-transform: uppercase; letter-spacing: 0.05em; }
.detail-val { font-size: 15px; font-weight: 500; color: var(--charcoal); }
.price-val { color: var(--forest); font-size: 18px; font-weight: 600; }

.animal-description { color: var(--stone); line-height: 1.7; margin-bottom: 20px; font-size: 15px; }

.tags-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
.tag { padding: 5px 12px; background: var(--parchment); border-radius: 100px; font-size: 13px; color: var(--stone); }

.booking-box {
  background: white;
  border: 1.5px solid var(--parchment);
  border-radius: var(--radius-xl);
  padding: 28px;
}
.booking-title { font-size: 20px; margin-bottom: 20px; }
.booking-auth-note { display: flex; align-items: center; gap: 12px; color: var(--stone); }
.booking-unavail { color: var(--rust); font-size: 14px; padding: 12px; background: rgba(196,98,58,0.08); border-radius: var(--radius-md); }
.booking-form { display: flex; flex-direction: column; gap: 14px; }
.booking-submit { width: 100%; justify-content: center; }

.reviews-section { margin-bottom: 60px; }
.add-review-box {
  background: white;
  border: 1.5px solid var(--parchment);
  border-radius: var(--radius-xl);
  padding: 24px;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.add-review-box h4 { font-family: var(--font-display); font-size: 18px; }
.reviews-list { display: flex; flex-direction: column; gap: 16px; }

.related-section { margin-bottom: 60px; }

@media (max-width: 900px) {
  .animal-hero { grid-template-columns: 1fr; gap: 28px; }
  .main-img { height: 320px; }
  .details-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .details-grid { grid-template-columns: 1fr; }
}
</style>
