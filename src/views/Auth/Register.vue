<template>
    <div class="auth-container">
      <Card class="auth-card">
        <template #title>
          <h2>Create an Account</h2>
        </template>
        <template #content>
          <form @submit.prevent="handleRegister">
            <div class="form-group">
              <label for="displayName">Full Name</label>
              <InputText 
                id="displayName" 
                v-model="displayName" 
                type="text" 
                required
                class="w-full"
              />
            </div>
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
                label="Register" 
                :loading="loading"
                class="w-full"
              />
            </div>
            <div class="form-footer">
              <p>Already have an account? <router-link to="/login">Login</router-link></p>
            </div>
          </form>
        </template>
      </Card>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { auth, db } from '../../firebase';
  import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';
  import Card from 'primevue/card';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';
  
  const router = useRouter();
  const displayName = ref('');
  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const loading = ref(false);
  
  const handleRegister = async () => {
    loading.value = true;
    errorMessage.value = '';
    
    try {
     
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
      const user = userCredential.user;
      
   
      await updateProfile(user, {
        displayName: displayName.value
      });
      
   
      await setDoc(doc(db, "users", user.uid), {
        displayName: displayName.value,
        email: email.value,
        createdAt: new Date(),
        interestedProjects: [],
        createdProjects: []
      });
      
      router.push('/discover');
    } catch (error) {
      console.error('Registration error:', error);
      errorMessage.value = error.message || 'Registration failed. Please try again.';
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