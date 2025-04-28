<script>
import { enable as enableDarkMode, disable as disableDarkMode, isEnabled } from 'darkreader';
import { ref, onMounted } from 'vue';

const darkModeEnabled = ref(false);

function toggleDarkMode() {
  if (darkModeEnabled.value) {
    disableDarkMode();
    darkModeEnabled.value = false;
  } else {
    enableDarkMode({
      brightness: 100,
      contrast: 110,
      sepia: 0
    });
    darkModeEnabled.value = true;
  }
}

onMounted(() => {
  darkModeEnabled.value = isEnabled();
});
</script>

<template>
  <div class="app-container">

  <!-- Dark Mode Toggle Button -->
  <button @click="toggleDarkMode" class="dark-mode-toggle">
    <i :class="darkModeEnabled ? 'pi pi-sun' : 'pi pi-moon'"></i>
  </button>

  <!-- Show the full layout ONLY if the user is logged in -->
  <template v-if="isLoggedIn">
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
         <!-- Links relevant when logged in -->
         <li><router-link to="/"><i class="pi pi-home"></i><span>Home</span></router-link></li>
         <li><router-link to="/discover"><i class="pi pi-search"></i><span>Discover Projects</span></router-link></li>
         <li><router-link to="/dashboard"><i class="pi pi-th-large"></i><span>Dashboard</span></router-link></li>
         <li><a href="#" @click.prevent="handleLogout"><i class="pi pi-sign-out"></i><span>Logout</span></a></li>
       </ul>
      </div>
      <div class="sidebar-footer">
       <div class="user-profile">
         <div class="user-avatar"><i class="pi pi-user"></i></div>
         <div class="user-info"><span>User Profile</span></div>
       </div>
      </div>
    </div>

    <!-- Main Content Area (for logged-in state) -->
    <div class="main-content">
      <header class="top-bar">
       <div class="menu-toggle">
         <button class="p-link"><i class="pi pi-bars"></i></button>
       </div>
       <div class="top-menu">
         <ul>
         <li><a href="#" class="p-link"><i class="pi pi-bell"></i></a></li>
         <li><a href="#" class="p-link"><i class="pi pi-cog"></i></a></li>
         </ul>
       </div>
      </header>
      <div class="content">
       <!-- This router-view renders components for logged-in users -->
       <router-view :key="$route.fullPath" />
      </div>
    </div>
    </div>
  </template>

  <!-- Show only the routed component if the user is logged OUT -->
  <template v-else>
     <!-- This router-view renders Login, Register, public pages etc. -->
     <router-view :key="$route.fullPath" />
  </template>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const router = useRouter();
const isLoggedIn = ref(false);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
  isLoggedIn.value = !!user;
  // console.log('Auth State Changed - isLoggedIn:', isLoggedIn.value); // Debug log
  });
});

const handleLogout = async () => {
  try {
  await signOut(auth);
  // No need to push here if onAuthStateChanged handles redirect logic via router guards
  // If not using guards, you might still need: router.push('/login');
  console.log('Logout successful');
  } catch (error) {
  console.error('Logout error:', error);
  }
};

// No PrimeVue imports needed directly in App.vue unless used in this specific template
</script>

<style>
/* Styles remain the same */

.dark-mode-toggle {
  position: fixed;
  top: 1rem;
  right: 2rem;
  background-color: transparent;
  border: none;
  border-radius: 5rem;
  cursor: pointer;
  font-size: 1.5rem;
  color: #555;
  z-index: 1000; /* Ensure it's above other elements */
}


* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
  Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  /*background-color: #f9f9f9;
  color: #333;*/
  line-height: 1.6;
}

/* App Container - Ensure it takes full height if needed */
.app-container {
  min-height: 100vh;
  display: flex; /* Use flex to manage layout */
  flex-direction: column; /* Stack elements vertically */
}

/* Layout Structure (Only applies when logged in) */
.layout-wrapper {
  display: flex;
  flex-grow: 1; /* Allow wrapper to grow and fill space */
  min-height: 100vh; /* Ensure it takes at least full viewport height */
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
  left: 0; /* Ensure it starts at the left */
  top: 0; /* Ensure it starts at the top */
  z-index: 999;
  transition: width 0.3s ease; /* Added transition */
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
  white-space: nowrap; /* Prevent text wrapping */
  overflow: hidden; /* Hide overflow */
}

.sidebar-menu a:hover,
.sidebar-menu a.router-link-active {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.sidebar-menu i {
  margin-right: 0.75rem;
  font-size: 1.25rem;
  flex-shrink: 0; /* Prevent icon from shrinking */
}
.sidebar-menu span {
   transition: opacity 0.3s ease, width 0.3s ease; /* Add transition for text */
}


.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  white-space: nowrap; /* Prevent text wrapping */
  overflow: hidden; /* Hide overflow */
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
  flex-shrink: 0; /* Prevent avatar from shrinking */
}

.user-avatar i {
  font-size: 1.25rem;
  color: #888;
}

.user-info span {
  font-weight: 500;
  transition: opacity 0.3s ease, width 0.3s ease; /* Add transition for text */
}

/* Main Content (Only applies when logged in) */
.main-content {
  flex: 1;
  margin-left: 260px; /* Should match sidebar width */
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease; /* Added transition */
}

.top-bar {
  height: 64px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 998;
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
  flex: 1; /* Allow content to grow */
  background-color: #f9f9f9;
}

/* Styles for Logged-Out State */
/* You might want specific styles for the logged-out container if needed */
/* e.g., centering the login form */
template:not([v-if="isLoggedIn"]) > div { 


  margin-top : 0.1rem;
  /* Example targeting the container of logged-out view */
   /* display: flex; */
   /* justify-content: center; */
   /* align-items: center; */
   /* min-height: 100vh; */
}


/* Responsive Adjustments */
@media (max-width: 992px) {
  /* Only apply sidebar collapse if logged in */
  .layout-wrapper .sidebar {
  width: 80px;
  }

  .layout-wrapper .main-content {
  margin-left: 80px;
  }

  .layout-wrapper .logo a span {
   opacity: 0;
   width: 0;
   pointer-events: none;
   display: none;
  }
   .layout-wrapper .logo a {
   justify-content: center;
   }

  .layout-wrapper .sidebar-menu a span {
  opacity: 0;
  width: 0;
  pointer-events: none;
  display: none;
  }

  .layout-wrapper .sidebar-menu i {
  margin-right: 0;
  }

  .layout-wrapper .sidebar-menu a {
  justify-content: center;
  padding: 0.75rem 0;
  margin: 0 0.5rem;
  }

  .layout-wrapper .user-info span {
  opacity: 0;
  width: 0;
  pointer-events: none;
   display: none;
  }

  .layout-wrapper .user-profile {
    justify-content: center;
  }

  .layout-wrapper .user-avatar {
    margin-right: 0;
  }

  .layout-wrapper .sidebar-footer {
    padding: 1rem 0.5rem;
  }
}

</style>