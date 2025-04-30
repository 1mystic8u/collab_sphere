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

  <button @click="toggleDarkMode" class="dark-mode-toggle">
    <i :class="darkModeEnabled ? 'pi pi-sun' : 'pi pi-moon'"></i>
  </button>

  <template v-if="isLoggedIn">
    <div class="layout-wrapper">
    <div class="sidebar">
      <div class="sidebar-header">
      <div class="logo">
        <router-link to="/">Collab-Sphere</router-link>
      </div>
      </div>
      <div class="sidebar-menu">
       <ul>
         <li><router-link to="/home"><i class="pi pi-home"></i><span>Home</span></router-link></li>
         <li><router-link to="/discover"><i class="pi pi-search"></i><span>Discover Projects</span></router-link></li>
         <li><router-link to="/dashboard"><i class="pi pi-th-large"></i><span>Dashboard</span></router-link></li>
         <li><a href="#" @click.prevent="handleLogout"><i class="pi pi-sign-out"></i><span>Logout</span></a></li>
       </ul>
      </div>
      <div class="sidebar-footer">
       <div class="user-profile">
         <div class="user-avatar"><i class="pi pi-user"></i></div>
         <div class="user-info"><span></span></div>
       </div>
      </div>
    </div>

    <div class="main-content">
      <header class="top-bar">
       <div class="menu-toggle">
         <button class="p-link"><i class="pi pi-bars"></i></button>
       </div>
       <div class="top-menu">
         <ul>
         <!--<li><a href="#" class="p-link"><i class="pi pi-bell"></i></a></li>
         <li><a href="#" class="p-link"><i class="pi pi-cog"></i></a></li> -->
         </ul>
       </div>
      </header>
      <div class="content">
       <router-view :key="$route.fullPath" />
      </div>
    </div>
    </div>
  </template>

  <template v-else>
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

  console.log('Logout successful');
  } catch (error) {
  console.error('Logout error:', error);
  }
};

</script>

<style>

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
  z-index: 1000; 
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

.app-container {
  min-height: 100vh;
  display: flex; 
  flex-direction: column; 
}

.layout-wrapper {
  display: flex;
  flex-grow: 1; 
  min-height: 100vh; 
}

.sidebar {
  width: 260px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  left: 0; 
  top: 0; 
  z-index: 999;
  transition: width 0.3s ease;
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
  white-space: nowrap; 
  overflow: hidden; 
}

.sidebar-menu a:hover,
.sidebar-menu a.router-link-active {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.sidebar-menu i {
  margin-right: 0.75rem;
  font-size: 1.25rem;
  flex-shrink: 0;
}
.sidebar-menu span {
   transition: opacity 0.3s ease, width 0.3s ease; /* Add transition for text */
}


.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  white-space: nowrap; 
  overflow: hidden; 
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
  flex-shrink: 0; 
}

.user-avatar i {
  font-size: 1.25rem;
  color: #888;
}

.user-info span {
  font-weight: 500;
  transition: opacity 0.3s ease, width 0.3s ease;
}

.main-content {
  flex: 1;
  margin-left: 260px; 
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease; 
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


template:not([v-if="isLoggedIn"]) > div { 


  margin-top : 0.1rem;

}


@media (max-width: 992px) {
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