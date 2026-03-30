// src/store/bookings.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, query, where, orderBy, getDocs,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, onSnapshot
} from 'firebase/firestore'
import { db } from '@/firebase/config.js'

export const useBookingsStore = defineStore('bookings', () => {
  const activeBookings = ref([])   // корзина / активные
  const history = ref([])          // история
  const loading = ref(false)
  let unsubActive = null

  // Real-time подписка на активные бронирования пользователя
  function subscribeActiveBookings(userId) {
    if (unsubActive) unsubActive()
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      where('status', 'in', ['pending', 'confirmed']),
      orderBy('createdAt', 'desc')
    )
    unsubActive = onSnapshot(q, snap => {
      activeBookings.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
    return unsubActive
  }

  function stopActiveSubscription() {
    if (unsubActive) { unsubActive(); unsubActive = null }
  }

  async function fetchHistory(userId) {
    loading.value = true
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        where('status', 'in', ['completed', 'cancelled']),
        orderBy('createdAt', 'desc')
      )
      const snap = await getDocs(q)
      history.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    } finally {
      loading.value = false
    }
  }

  async function createBooking(userId, animal, visitDate, notes = '') {
    const booking = {
      userId,
      animalId: animal.id,
      animalName: animal.name,
      animalImage: animal.image,
      animalSpecies: animal.species,
      animalBreed: animal.breed,
      price: animal.price,
      visitDate,
      notes,
      status: 'pending',
      createdAt: serverTimestamp()
    }
    return await addDoc(collection(db, 'bookings'), booking)
  }

  async function cancelBooking(bookingId) {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    })
  }

  async function deleteBooking(bookingId) {
    await deleteDoc(doc(db, 'bookings', bookingId))
  }

  async function confirmBooking(bookingId) {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'confirmed',
      updatedAt: serverTimestamp()
    })
  }

  async function completeBooking(bookingId) {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'completed',
      updatedAt: serverTimestamp()
    })
  }

  // Admin: fetch all bookings
  async function fetchAllBookings() {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  return {
    activeBookings, history, loading,
    subscribeActiveBookings, stopActiveSubscription,
    fetchHistory, createBooking, cancelBooking,
    deleteBooking, confirmBooking, completeBooking, fetchAllBookings
  }
})
