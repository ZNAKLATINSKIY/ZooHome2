import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  collection, query, orderBy, limit,
  getDocs, getDoc, doc, addDoc,
  updateDoc, deleteDoc, serverTimestamp, onSnapshot,
  getCountFromServer
} from 'firebase/firestore'
import { db } from '@/firebase/config.js'
import { seedDatabase } from '@/firebase/seed.js'

const PAGE_SIZE = 9
const SEED_INDEX_DELAY_MS = 1500

export const useAnimalsStore = defineStore('animals', () => {
  const allAnimals = ref([])
  const animals = ref([])
  const loading = ref(false)
  const hasMore = ref(false)
  const total = ref(0)
  let unsubscribe = null
  let activeFilteredList = []
  let activeFilters = {}

  function applyClientFilters(list, { category, search, sortBy, gender, available } = {}) {
    let result = [...list]
    if (category && category !== 'all') {
      result = result.filter(a => a.category === category)
    }
    if (gender && gender !== 'all') {
      result = result.filter(a => a.gender === gender)
    }
    if (available !== null && available !== undefined && available !== 'all') {
      const avail = available === 'true' || available === true
      result = result.filter(a => a.available === avail)
    }
    if (search) {
      const s = search.toLowerCase()
      result = result.filter(a =>
        a.name?.toLowerCase().includes(s) ||
        a.breed?.toLowerCase().includes(s) ||
        a.species?.toLowerCase().includes(s) ||
        a.description?.toLowerCase().includes(s)
      )
    }
    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break
      case 'price_desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break
      case 'age': result.sort((a, b) => (a.age || 0) - (b.age || 0)); break
      default: result.sort((a, b) => {
        const ta = a.createdAt?.seconds || 0
        const tb = b.createdAt?.seconds || 0
        return tb - ta
      })
    }
    return result
  }

  async function fetchAnimals(filters = {}) {
    loading.value = true
    animals.value = []
    hasMore.value = false
    activeFilters = { ...filters }

    try {
      const countSnap = await getCountFromServer(collection(db, 'animals'))
      total.value = countSnap.data().count

      if (total.value === 0) {
        try {
          await seedDatabase()
          await new Promise(resolve => setTimeout(resolve, SEED_INDEX_DELAY_MS))
          const recount = await getCountFromServer(collection(db, 'animals'))
          total.value = recount.data().count
        } catch (e) {
          console.error('Auto-seed failed:', e)
        }
      }

      const q = query(collection(db, 'animals'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      allAnimals.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      activeFilteredList = applyClientFilters(allAnimals.value, filters)
      animals.value = activeFilteredList.slice(0, PAGE_SIZE)
      hasMore.value = activeFilteredList.length > PAGE_SIZE
    } catch (e) {
      console.error('fetchAnimals error:', e)
    } finally {
      loading.value = false
    }
  }

  async function loadMore(filters = {}) {
    if (!hasMore.value) return
    loading.value = true

    try {
      const currentCount = animals.value.length
      const keys = Object.keys(filters)
      const filtersChanged = keys.length !== Object.keys(activeFilters).length ||
        keys.some(k => filters[k] !== activeFilters[k])
      if (filtersChanged) {
        activeFilters = { ...filters }
        activeFilteredList = applyClientFilters(allAnimals.value, filters)
      }
      const nextBatch = activeFilteredList.slice(currentCount, currentCount + PAGE_SIZE)
      animals.value.push(...nextBatch)
      hasMore.value = animals.value.length < activeFilteredList.length
    } catch (e) {
      console.error('loadMore error:', e)
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
          const exists = allAnimals.value.find(a => a.id === newAnimal.id)
          if (!exists) {
            allAnimals.value.unshift(newAnimal)
            activeFilteredList = applyClientFilters(allAnimals.value, activeFilters)
            const displayed = animals.value.length
            animals.value = activeFilteredList.slice(0, Math.max(displayed, PAGE_SIZE))
            hasMore.value = animals.value.length < activeFilteredList.length
            if (callback) callback(newAnimal)
          }
        }
        if (change.type === 'modified') {
          const idx = allAnimals.value.findIndex(a => a.id === change.doc.id)
          if (idx !== -1) {
            allAnimals.value[idx] = { id: change.doc.id, ...change.doc.data() }
            activeFilteredList = applyClientFilters(allAnimals.value, activeFilters)
            const displayed = animals.value.length
            animals.value = activeFilteredList.slice(0, displayed)
            hasMore.value = displayed < activeFilteredList.length
          }
        }
        if (change.type === 'removed') {
          allAnimals.value = allAnimals.value.filter(a => a.id !== change.doc.id)
          activeFilteredList = applyClientFilters(allAnimals.value, activeFilters)
          const displayed = Math.min(animals.value.length, activeFilteredList.length)
          animals.value = activeFilteredList.slice(0, displayed)
          hasMore.value = displayed < activeFilteredList.length
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
