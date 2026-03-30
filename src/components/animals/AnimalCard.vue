<template>
  <RouterLink :to="`/animal/${animal.id}`" class="animal-card card">
    <div class="animal-img-wrap">
      <img
        :src="animal.image || fallback"
        :alt="animal.name"
        class="animal-img"
        loading="lazy"
        @error="e => e.target.src = fallback"
      />
      <div class="animal-category">{{ categoryLabel }}</div>
      <div class="animal-availability" :class="animal.available ? 'avail-yes' : 'avail-no'">
        {{ animal.available ? 'Доступен' : 'Занят' }}
      </div>
    </div>
    <div class="animal-body">
      <div class="animal-top">
        <h3 class="animal-name">{{ animal.name }}</h3>
        <span class="animal-price">{{ formatPrice(animal.price) }} ₸</span>
      </div>
      <p class="animal-breed">{{ animal.species }} · {{ animal.breed }}</p>
      <p class="animal-age">{{ ageText }}</p>
      <p class="animal-desc">{{ truncate(animal.description, 80) }}</p>
      <div class="animal-footer">
        <div class="stars-wrap">
          <StarsDisplay :rating="animal.rating" />
          <span class="reviews-count">({{ animal.reviewsCount || 0 }})</span>
        </div>
        <div class="tags-wrap">
          <span v-for="tag in (animal.tags || []).slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import StarsDisplay from '@/components/ui/StarsDisplay.vue'

const props = defineProps({ animal: Object })

const fallback = 'https://images.unsplash.com/photo-1548681528-6a5c45b66063?w=600&q=80'

const catMap = {
  cats: '🐱 Кошки', dogs: '🐶 Собаки',
  birds: '🦜 Птицы', rodents: '🐹 Грызуны', other: '🐾 Другие'
}
const categoryLabel = catMap[props.animal.category] || '🐾'

const ageText = (() => {
  const a = props.animal.age
  if (!a) return ''
  if (a === 1) return '1 год'
  if (a < 5) return `${a} года`
  return `${a} лет`
})()

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}
function formatPrice(p) {
  return p?.toLocaleString('ru-RU') || '0'
}
</script>

<style scoped>
.animal-card { display: block; }

.animal-img-wrap {
  position: relative;
  height: 220px;
  overflow: hidden;
}
.animal-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.animal-card:hover .animal-img { transform: scale(1.05); }

.animal-category {
  position: absolute;
  top: 12px; left: 12px;
  background: rgba(250, 247, 242, 0.92);
  backdrop-filter: blur(8px);
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  color: var(--charcoal);
}

.animal-availability {
  position: absolute;
  top: 12px; right: 12px;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
}
.avail-yes { background: rgba(61, 90, 62, 0.9); color: white; }
.avail-no { background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.7); }

.animal-body { padding: 18px; }

.animal-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}
.animal-name {
  font-size: 20px;
  font-family: var(--font-display);
  color: var(--charcoal);
}
.animal-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--forest);
  white-space: nowrap;
}
.animal-breed { font-size: 13px; color: var(--stone); margin-bottom: 2px; }
.animal-age { font-size: 13px; color: var(--mist); margin-bottom: 8px; }
.animal-desc { font-size: 13px; color: var(--stone); line-height: 1.5; margin-bottom: 12px; }

.animal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.stars-wrap { display: flex; align-items: center; gap: 4px; }
.reviews-count { font-size: 12px; color: var(--mist); }

.tags-wrap { display: flex; gap: 6px; flex-wrap: wrap; }
.tag {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 100px;
  background: var(--parchment);
  color: var(--stone);
}
</style>
