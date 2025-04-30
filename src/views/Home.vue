<script>
import Button from 'primevue/button';
</script>

<template>
  <div class="app-container">
    <div class="app-header">
      <div class="logo">
        <router-link to="/">
          <i class="pi pi-circle-fill logo-icon"></i> Collab-Sphere
        </router-link>
      </div>
      <nav class="nav-links">
        <router-link to="/">Home</router-link>
        <router-link to="/register">Register</router-link>
        <router-link to="/login">Login</router-link>
      </nav>
    </div>
    
    <div class="hero-section">
      <div class="hero-content">
        <h1>The best app in the world!</h1>
        <p class="subtitle">
          Connect with students, share ideas, and build amazing projects together. 
          Our platform makes collaboration easy and intuitive.
        </p>
        <div class="cta-buttons">
          <b><Button label="Discover"@click="router.push('/discover')"  class="primary-btn" /></b>
          <Button v-if="!isLoggedIn" label="Join Now" @click="router.push('/register')" icon="pi pi-play" class="secondary-btn" />
          <Button v-else label="Create Project"  @click="router.push('/create-project')" icon="pi pi-play" class="secondary-btn" />
        </div>
      </div>
      <div class="hero-image-container">
        <div class="phone phone-back"></div>
        <div class="phone phone-front"> 
          <img src="../assets/bgl.png" alt="Collab-Sphere" class="phone-content-image"  />
        </div>
      </div>
    </div>
    
    <div class="slanted-divider"></div>
    
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
.app-container {
  background-color: #f8fffd59;
  color: rgb(0, 0, 0);
  min-height: 100vh;
 
}

.app-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 5rem;
}

.logo a {
  font-size: 1.2rem;
  font-weight: bold;
  color: #080808;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position : absolute;
  left: 2vw;
  top: 1.5rem;
  margin-bottom : 1rem;

}

.logo-icon {
  color: #a3e635;
}

.nav-links {
  display: flex;
  gap: 1.5rem;

  
}

@media (max-width: 880px) {
  .nav-links {
    margin-top :1rem;
  }
}


.nav-links a {
  color: #363636;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  transition: color 0.2s;
  padding: 0.3rem 1rem;
  border-radius: 4rem;
  
}



.nav-links a:hover {

  background-color: #c8ffbd3d;
}

.hero-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 5rem;
  min-height: 70vh;
  position: relative;
  gap : 10vw;
}

.hero-content {
  max-width: 500px;
}

.hero-content h1 {
  font-size: 3rem;
  font-weight: 800;
  color: #2d3b21;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

.subtitle {
  font-size: 1.1rem;
  color: #9ca3af;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.primary-btn {
  background-color: #4ceb37f3 !important;
  border: none !important;
  color: #425742 !important;
  padding: 0.75rem 2rem !important;
  border-radius: 4px !important;

}

.primary-btn:hover {
  background-color: #4ff739ad !important;
  color: #21500b !important;
}

.secondary-btn {
  color: #2b5221c4 !important;
  border: none !important;
  padding: 0.75rem 1.5rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  background-color: #ffffff18;

}
.secondary-btn:hover {
  background-color: #8efa7f49 !important;

}

.hero-image-container {
  position: relative;
  height: 400px;
  width: 300px;
}

.phone {
  position: absolute;
  width: 220px;
  height: 400px;
  background-color: #6cd82e;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.phone-back {
  right: 40px;
  top: 20px;
  background-color: #e5e7eb;
  z-index: 1;
  transform: rotate(-6deg);
}

.phone-front {
  right: 0;
  top: 0;
  z-index: 2;
}
.phone-front {
  position: relative;
  overflow: hidden;
  border: 8px solid white;
  box-sizing: border-box;
}

.phone-content-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; 
  object-position: center; 
  border-radius: 16px;
}

.phone-front::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.slanted-divider {
  height: 100px;
  background-color: #59d440;
  position: relative;
  z-index: 1;
}

.slanted-divider::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background-color: #f9fafb;
  clip-path: polygon(0 100%, 100% 0, 100% 100%);
}

.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 5rem;
  background-color: #f9fafb;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.feature-icon {
  font-size: 2rem;
  color: #a3e635;
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

@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }
  
  .hero-content {
    max-width: 100%;
    margin-bottom: 3rem;
  }
  
  .cta-buttons {
    justify-content: center;
  }
  
  .app-header {
    padding: 1.5rem 2rem;
  }
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: center;
  }
  
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .features-section {
    padding: 3rem 2rem;
  }
}

@media (max-width: 640px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
  }
  
  .phone {
    width: 180px;
    height: 320px;
  }
}
</style>