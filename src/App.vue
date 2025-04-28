<template>
  <div class="app-container">   
    
    <header v-if="isLoggedIn" class="app-header">

      <div class="layout-wrapper">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <router-link to="/">Collab-Sphere</router-link>
        </div>
      </div>
      
      <div class="sidebar-menu">
        <ul>
          <li>
            <router-link to="/">
              <i class="pi pi-home"></i>
              <span>Home</span>
            </router-link>
          </li>
          <li>
            <router-link to="/discover">
              <i class="pi pi-search"></i>
              <span>Discover Projects</span>
            </router-link>
          </li>
          <li v-if="isLoggedIn">
            <router-link to="/dashboard">
              <i class="pi pi-th-large"></i>
              <span>Dashboard</span>
            </router-link>
          </li>
          <li v-if="isLoggedIn">
            <a href="#" @click.prevent="handleLogout">
              <i class="pi pi-sign-out"></i>
              <span>Logout</span>
            </a>
          </li>
          <li v-if="!isLoggedIn">
            <router-link to="/login">
              <i class="pi pi-sign-in"></i>
              <span>Login</span>
            </router-link>
          </li>
          <li v-if="!isLoggedIn">
            <router-link to="/register">
              <i class="pi pi-user-plus"></i>
              <span>Register</span>
            </router-link>
          </li>
        </ul>
      </div>
      
      <div class="sidebar-footer" v-if="isLoggedIn">
        <div class="user-profile">
          <div class="user-avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="user-info">
            <span>User Profile</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="main-content">
      <header class="top-bar">
        <div class="menu-toggle">
          <button class="p-link">
            <i class="pi pi-bars"></i>
          </button>
        </div>
        
        <div class="top-menu">
          <ul>
            <li v-if="isLoggedIn">
              <a href="#" class="p-link">
                <i class="pi pi-bell"></i>
              </a>
            </li>
            <li v-if="isLoggedIn">
              <a href="#" class="p-link">
                <i class="pi pi-cog"></i>
              </a>
            </li>
          </ul>
        </div>
      </header>
      
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
      
     
    </header>


    <main class="app-content">


      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';


// prime comp imorts
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Chip from 'primevue/chip';
import Avatar from 'primevue/avatar';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';

const router = useRouter();
const isLoggedIn = ref(false);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user;
  });
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #f9f9f9;
  color: #333;
  line-height: 1.6;
}

/* Layout Structure */
.layout-wrapper {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  z-index: 999;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #10b981;
  text-decoration: none;
}

.sidebar-menu {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.sidebar-menu ul {
  list-style: none;
}

.sidebar-menu li {
  margin-bottom: 0.5rem;
}

.sidebar-menu a {
  margin: 0 1rem;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: #555;
  text-decoration: none;
  transition: all 0.3s ease;
}

.sidebar-menu a:hover,
.sidebar-menu a.router-link-active {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.sidebar-menu i {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.user-profile {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9e9e9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.user-avatar i {
  font-size: 1.25rem;
  color: #888;
}

.user-info span {
  font-weight: 500;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 64px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

.menu-toggle {
  display: none;
}

.menu-toggle button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #555;
}

.top-menu ul {
  display: flex;
  list-style: none;
  gap: 1rem;
}

.top-menu a {
  font-size: 1.25rem;
  color: #555;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.top-menu a:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.content {
  padding: 2rem;
  flex: 1;
}

/* Responsive */
@media (max-width: 992px) {
  .sidebar {
    width: 80px; /* Collapsed width */
  }

  .main-content {
    margin-left: 80px; /* Adjust margin to match collapsed sidebar */
  }

  .logo a span { /* Hide the text part of the logo */
     opacity: 0;
     width: 0; /* Collapse width */
     pointer-events: none; /* Prevent interaction */
  }
   /* Optional: Add an icon-only logo for small screens if needed */
   .logo a {
     /* Adjust padding or size if needed */
     justify-content: center;
   }


  .sidebar-menu a span { /* Hide menu item text */
    opacity: 0;
    width: 0; /* Collapse width */
    pointer-events: none; /* Prevent interaction */
  }

  .sidebar-menu i { /* Center the icon */
    margin-right: 0;
  }

  .sidebar-menu a { /* Adjust padding and center content */
    justify-content: center;
    padding: 0.75rem 0; /* Adjust vertical padding if needed */
  }

  .user-info span { /* Hide user profile text */
    opacity: 0;
    width: 0; /* Collapse width */
    pointer-events: none; /* Prevent interaction */
  }

  .user-profile { /* Center avatar */
      justify-content: center;
  }

  .user-avatar { /* Remove margin when text is hidden */
      margin-right: 0;
  }

  .sidebar-footer {
      padding: 1rem 0.5rem; /* Adjust padding */
  }

  /* Keep the menu toggle hidden as the sidebar is always visible */
  .menu-toggle {
    display: none;
  }
}

</style>