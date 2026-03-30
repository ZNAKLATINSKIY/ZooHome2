import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase/config.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => userProfile.value?.role === 'admin')
  const displayName = computed(() => userProfile.value?.displayName || user.value?.email || '')

  async function fetchUserProfile(uid) {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      userProfile.value = docSnap.data()
    }
  }

  function init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          user.value = firebaseUser
          await fetchUserProfile(firebaseUser.uid)
        } else {
          user.value = null
          userProfile.value = null
        }
        loading.value = false
        resolve()
      })
    })
  }

  async function register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await setDoc(doc(db, 'users', cred.user.uid), {
      displayName,
      email,
      role: 'user',
      createdAt: serverTimestamp(),
      phone: '',
      avatar: ''
    })
    user.value = cred.user
    await fetchUserProfile(cred.user.uid)
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    user.value = cred.user
    await fetchUserProfile(cred.user.uid)
  }

  async function logout() {
    await signOut(auth)
    user.value = null
    userProfile.value = null
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email)
  }

  async function updateUserProfile(data) {
    if (!user.value) return
    await setDoc(doc(db, 'users', user.value.uid), data, { merge: true })
    userProfile.value = { ...userProfile.value, ...data }
  }

  return {
    user, userProfile, loading,
    isLoggedIn, isAdmin, displayName,
    init, register, login, logout, resetPassword, updateUserProfile, fetchUserProfile
  }
})
