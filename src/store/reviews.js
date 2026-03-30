// src/store/reviews.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, query, where, orderBy, getDocs, addDoc,
  deleteDoc, doc, updateDoc, serverTimestamp, runTransaction, getDoc
} from 'firebase/firestore'
import { db } from '@/firebase/config.js'

export const useReviewsStore = defineStore('reviews', () => {
  const reviews = ref([])
  const loading = ref(false)

  async function fetchReviews(animalId) {
    loading.value = true
    try {
      const q = query(
        collection(db, 'reviews'),
        where('animalId', '==', animalId),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      reviews.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } finally {
      loading.value = false
    }
  }

  async function addReview(userId, userName, animalId, rating, text) {
    const reviewRef = await addDoc(collection(db, 'reviews'), {
      userId, userName, animalId, rating, text,
      createdAt: serverTimestamp()
    })

    // Update animal rating
    await runTransaction(db, async (tx) => {
      const animalRef = doc(db, 'animals', animalId)
      const animalSnap = await tx.get(animalRef)
      if (!animalSnap.exists()) return
      const data = animalSnap.data()
      const newCount = (data.reviewsCount || 0) + 1
      const newRating = ((data.rating || 0) * (newCount - 1) + rating) / newCount
      tx.update(animalRef, {
        rating: Math.round(newRating * 10) / 10,
        reviewsCount: newCount
      })
    })

    reviews.value.unshift({
      id: reviewRef.id, userId, userName, animalId, rating, text,
      createdAt: { toDate: () => new Date() }
    })
  }

  async function deleteReview(reviewId, animalId, rating) {
    await deleteDoc(doc(db, 'reviews', reviewId))

    await runTransaction(db, async (tx) => {
      const animalRef = doc(db, 'animals', animalId)
      const animalSnap = await tx.get(animalRef)
      if (!animalSnap.exists()) return
      const data = animalSnap.data()
      const newCount = Math.max(0, (data.reviewsCount || 1) - 1)
      const newRating = newCount === 0 ? 0 :
        ((data.rating * (newCount + 1)) - rating) / newCount
      tx.update(animalRef, {
        rating: Math.round(Math.max(0, newRating) * 10) / 10,
        reviewsCount: newCount
      })
    })

    reviews.value = reviews.value.filter(r => r.id !== reviewId)
  }

  async function fetchUserReviews(userId) {
    const q = query(
      collection(db, 'reviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  async function fetchAllReviews() {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  return { reviews, loading, fetchReviews, addReview, deleteReview, fetchUserReviews, fetchAllReviews }
})
