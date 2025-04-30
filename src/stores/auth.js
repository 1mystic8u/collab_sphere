import { defineStore } from 'pinia'
import { auth }   from '@/firebase/index.js'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: undefined,
    isAuthReady: false, 
    unsubscribe: null, 
  }),
  actions: {
    init() {
      console.log("Auth Store: init() called."); 
     
      if (this.unsubscribe) {
          console.log("Auth Store: Already initialized.");
          return;
      }

      console.log("Auth Store: Setting up onAuthStateChanged listener.");
      this.unsubscribe = onAuthStateChanged(auth, u => {
        console.log("Auth Store: onAuthStateChanged callback fired. User:", u ? u.email : 'null'); // Log changes
        this.user = u;
        if (!this.isAuthReady) {
          console.log("Auth Store: Setting isAuthReady = true.");
          this.isAuthReady = true; 
        }
      }, error => {
        console.error("Auth Store: onAuthStateChanged error:", error);
        this.user = null;
        if (!this.isAuthReady) {
          console.log("Auth Store: Setting isAuthReady = true (on error).");
          this.isAuthReady = true; 
        }
      });
    },
    async login(email, pass) {
      await signInWithEmailAndPassword(auth, email, pass);
    },
    async logout() {
      await signOut(auth);
    }
  }
})
