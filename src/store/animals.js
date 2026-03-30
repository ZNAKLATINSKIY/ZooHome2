import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, query, where, orderBy, limit,
  startAfter, getDocs, getDoc, doc, addDoc,
  updateDoc, deleteDoc, serverTimestamp, onSnapshot,
  getCountFromServer
} from 'firebase/firestore'
import { db } from '@/firebase/config.js'
import { seedDatabase } from '@/firebase/seed.js'

const PAGE_SIZE = 9
const SEED_INDEX_DELAY_MS = 1500

export const useAnimalsStore = defineStore('animals', () => {
  const animals = ref([])
  const loading = ref(false)
  const lastDoc = ref(null)
  const hasMore = ref(true)
  const total = ref(0)
  let unsubscribe = null

  function buildConstraints({ category, search, sortBy, gender, available }) {
    const constraints = []
    if (category && category !== 'all') {
      constraints.push(where('category', '==', category))
    }
    if (gender && gender !== 'all') {
      constraints.push(where('gender', '==', gender))
    }
    if (available !== null && available !== undefined && available !== 'all') {
      constraints.push(where('available', '==', available === 'true' || available === true))
    }
    switch (sortBy) {
      case 'price_asc': constraints.push(orderBy('price', 'asc')); break
      case 'price_desc': constraints.push(orderBy('price', 'desc')); break
      case 'rating': constraints.push(orderBy('rating', 'desc')); break
      case 'age': constraints.push(orderBy('age', 'asc')); break
      default: constraints.push(orderBy('createdAt', 'desc'))
    }
    return constraints
  }

  async function fetchAnimals(filters = {}) {
    loading.value = true
    animals.value = []
    lastDoc.value = null
    hasMore.value = true

    try {
      const countSnap = await getCountFromServer(collection(db, 'animals'))
      total.value = countSnap.data().count

      let justSeeded = false
      if (total.value === 0) {
        try {
          await seedDatabase()
          // Wait for Firestore to finish indexing the new serverTimestamp() documents
          await new Promise(resolve => setTimeout(resolve, SEED_INDEX_DELAY_MS))
          const recount = await getCountFromServer(collection(db, 'animals'))
          total.value = recount.data().count
          justSeeded = true
        } catch (e) {
          console.error('Auto-seed failed:', e)
        }
      }

      const constraints = buildConstraints(filters)
      const q = query(collection(db, 'animals'), ...constraints, limit(PAGE_SIZE))
      const snap = await getDocs(q)

      if (justSeeded && snap.docs.length === 0 && animals.value.length > 0) {
        lastDoc.value = null
        hasMore.value = false
        return
      }

      animals.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      lastDoc.value = snap.docs[snap.docs.length - 1] || null
      hasMore.value = snap.docs.length === PAGE_SIZE

      if (filters.search) {
        const s = filters.search.toLowerCase()
        animals.value = animals.value.filter(a =>
          a.name?.toLowerCase().includes(s) ||
          a.breed?.toLowerCase().includes(s) ||
          a.species?.toLowerCase().includes(s) ||
          a.description?.toLowerCase().includes(s)
        )
      }
    } finally {
      loading.value = false
    }
  }

  async function loadMore(filters = {}) {
    if (!hasMore.value || !lastDoc.value) return
    loading.value = true

    try {
      const constraints = buildConstraints(filters)
      const q = query(
        collection(db, 'animals'), ...constraints,
        startAfter(lastDoc.value), limit(PAGE_SIZE)
      )
      const snap = await getDocs(q)
      const newItems = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      animals.value.push(...newItems)
      lastDoc.value = snap.docs[snap.docs.length - 1] || null
      hasMore.value = snap.docs.length === PAGE_SIZE
    } finally {
      loading.value = false
    }
  }

  function subscribeToAnimals(callback) {
    if (unsubscribe) unsubscribe()
    const q = query(collection(db, 'animals'), orderBy('createdAt', 'desc'), limit(1))
    unsubscribe = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          const newAnimal = { id: change.doc.id, ...change.doc.data() }
          const exists = animals.value.find(a => a.id === newAnimal.id)
          if (!exists) {
            animals.value.unshift(newAnimal)
            if (callback) callback(newAnimal)
          }
        }
        if (change.type === 'modified') {
          const idx = animals.value.findIndex(a => a.id === change.doc.id)
          if (idx !== -1) {
            animals.value[idx] = { id: change.doc.id, ...change.doc.data() }
          }
        }
        if (change.type === 'removed') {
          animals.value = animals.value.filter(a => a.id !== change.doc.id)
        }
      })
    })
    return unsubscribe
  }

  function stopSubscription() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  async function getAnimal(id) {
    const docSnap = await getDoc(doc(db, 'animals', id))
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() }
    return null
  }

  async function addAnimal(data) {
    return await addDoc(collection(db, 'animals'), {
      ...data,
      rating: 0,
      reviewsCount: 0,
      createdAt: serverTimestamp()
    })
  }

  async function updateAnimal(id, data) {
    await updateDoc(doc(db, 'animals', id), { ...data, updatedAt: serverTimestamp() })
  }

  async function deleteAnimal(id) {
    await deleteDoc(doc(db, 'animals', id))
    animals.value = animals.value.filter(a => a.id !== id)
  }

  return {
    animals, loading, hasMore, total,
    fetchAnimals, loadMore, subscribeToAnimals, stopSubscription,
    getAnimal, addAnimal, updateAnimal, deleteAnimal
  }
})
