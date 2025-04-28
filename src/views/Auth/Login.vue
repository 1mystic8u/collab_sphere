<template>
    <div class="auth-container">
      <Card class="auth-card">
        <template #title>
          <h2>Login to Collab-Sphere</h2>
        </template>
        <template #content>
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email">Email</label>
              <InputText 
                id="email" 
                v-model="email" 
                type="email" 
                required
                class="w-full"
              />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <InputText 
                id="password" 
                v-model="password" 
                type="password" 
                required
                class="w-full"
              />
            </div>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <div class="form-actions">
              <Button 
                type="submit" 
                label="Login" 
                :loading="loading"
                class="w-full"
              />
            </div>
            <div class="form-footer">
              <p>Don't have an account? <router-link to="/register">Register</router-link></p>
            </div>
          </form>
        </template>
      </Card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { auth } from '../../firebase';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import Card from 'primevue/card';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';
  
  const router = useRouter();
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const loading = ref(false);
  
  const handleLogin = async () => {
    loading.value = true;
    errorMessage.value = '';
    
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      router.push('/discover');
    } catch (error) {
      console.error('Login error:', error);
      errorMessage.value = 'Invalid email or password. Please try again.';
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
  }
  
  .auth-card {
    width: 100%;
    max-width: 400px;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-actions {
    margin-top: 2rem;
  }
  
  .form-footer {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .form-footer a {
    color: #10b981;
    text-decoration: none;
    font-weight: 500;
  }
  
  .error-message {
    color: #ef4444;
    margin-top: 0.5rem;
  }
  
  .w-full {
    width: 100%;
  }
  </style>