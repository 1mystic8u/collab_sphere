import { defineStore } from 'pinia'
import { auth }   from '@/firebase/index.js'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: undefined, // Start as undefined until first check
    isAuthReady: false, // Flag for initial auth check completion
    unsubscribe: null, // To store the unsubscribe function
  }),
  actions: {
    init() {
      console.log("Auth Store: init() called."); // Log init call
      // Prevent multiple initializations if called again
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
          this.isAuthReady = true; // Mark auth as ready on first callback
        }
      }, error => {
        console.error("Auth Store: onAuthStateChanged error:", error);
        this.user = null; // Set user to null on error
        if (!this.isAuthReady) {
          console.log("Auth Store: Setting isAuthReady = true (on error).");
          this.isAuthReady = true; // Also mark as ready on error to unblock router
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
