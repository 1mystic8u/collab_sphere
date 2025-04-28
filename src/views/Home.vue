<script>
import Button from 'primevue/button';
</script>

<template>
  <div class="app-header">
      <div class="logo">
        <router-link to="/">Collab-Sphere</router-link>
      </div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/discover">Discover Projects</router-link>
        <template v-if="isLoggedIn">
          <router-link to="/dashboard">Dashboard</router-link>
          <a href="#" @click.prevent="handleLogout">Logout</a>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </template>
      </nav>
  </div>
    

    <div class="home-container">
      <div class="hero-section">
        <h1>Welcome to Collab-Sphere</h1>
        <p class="subtitle">Connect with students, share ideas, and build amazing projects together</p>
        <div class="cta-buttons">
          <Button label="Discover Projects" icon="pi pi-search" @click="router.push('/discover')" class="p-button-primary" />
          <Button v-if="!isLoggedIn" label="Join Now" icon="pi pi-user-plus" @click="router.push('/register')" class="p-button-outlined" />
          <Button v-else label="Create Project" icon="pi pi-plus" @click="router.push('/create-project')" class="p-button-outlined" />
        </div>
      </div>
      
      <div class="features-section">
        <div class="feature-card">
          <i class="pi pi-search feature-icon"></i>
          <h3>Discover</h3>
          <p>Find beginner-friendly open-source projects that match your skills and interests</p>
        </div>
        
        <div class="feature-card">
          <i class="pi pi-users feature-icon"></i>
          <h3>Collaborate</h3>
          <p>Connect with other students and work together on innovative solutions</p>
        </div>
        
        <div class="feature-card">
          <i class="pi pi-comments feature-icon"></i>
          <h3>Discuss</h3>
          <p>Ask questions, share ideas, and get feedback in project discussion threads</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { auth } from '../firebase';
  import { onAuthStateChanged } from 'firebase/auth';
  
  const router = useRouter();
  const isLoggedIn = ref(false);
  
  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      isLoggedIn.value = !!user;
    });
  });
  </script>
  
  <style scoped>

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #10b981;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: #555;
  text-decoration: none;
  font-weight: 500;
}

.nav-links a:hover {
  color: #10b981;
}

.app-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-between;
  }
}

  .home-container {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
  
  .hero-section {
    text-align: center;
    padding: 3rem 1rem;
    background-color: #f0fdf4;
    border-radius: 8px;
  }
  
  .hero-section h1 {
    font-size: 2.5rem;
    color: #10b981;
    margin-bottom: 1rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: #4b5563;
    max-width: 700px;
    margin: 0 auto 2rem;
  }
  
  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }
  
  .features-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }
  
  .feature-card {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
  
  .feature-icon {
    font-size: 2rem;
    color: #10b981;
    margin-bottom: 1rem;
  }
  
  .feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    color: #374151;
  }
  
  .feature-card p {
    color: #6b7280;
  }
  
  @media (max-width: 640px) {
    .hero-section h1 {
      font-size: 2rem;
    }
    
    .cta-buttons {
      flex-direction: column;
    }
  }
  </style>