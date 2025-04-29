<template>
    <div class="p-5 space-y-5">
      <h1 class="text-2xl font-bold">Welcome, {{ userData?.displayName }}</h1>
      <Button label="Create Project" icon="pi pi-plus" class="p-button-primary" @click="goToCreateProject" />
  
      <!-- Created Projects -->
      <div>
        <h2 class="text-xl font-semibold mb-3">Your Projects</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card v-for="project in createdProjects" :key="project.id">
            <template #title>
              <div class="text-green-600 text-sm">Active</div>
              <div class="font-bold text-lg">{{ project.title }}</div>
            </template>
            <template #content>
              <p>{{ project.description }}</p>
            </template>
          </Card>
        </div>
      </div>
  
      <!-- Interested Projects -->
      <div>
        <h2 class="text-xl font-semibold mb-3">Interested Projects</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card v-for="project in interestedProjects" :key="project.id">
            <template #title>
              <div class="text-blue-600 text-sm">Interested</div>
              <div class="font-bold text-lg">{{ project.title }}</div>
            </template>
            <template #content>
              <p>{{ project.description }}</p>
            </template>
          </Card>
        </div>
      </div>
  
      <!-- Recent Activity -->
      <div>
        <h2 class="text-xl font-semibold mb-3">Recent Activity</h2>
        <div v-for="(activity, index) in recentActivity" :key="index" class="flex items-start gap-3">
          <Avatar icon="pi pi-user" shape="circle" class="mr-2" />
          <div>
            <p class="text-sm"><strong>{{ activity.user }}</strong> commented on <strong>{{ activity.project }}</strong></p>
            <p class="text-xs text-gray-500">"{{ activity.content }}"</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { db } from '@/firebase'; // your Firebase setup
  import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
  import Card from 'primevue/card';
  import Avatar from 'primevue/avatar';
  import { Button } from 'primevue';
  
  // Props or Auth
  const currentUser = { uid: 'OHtlSeO1VwOa5O310cM9rWeyq8f2', displayName: 'yapakshi' }; // Replace with actual auth
  
  const createdProjects = ref([]);
  const interestedProjects = ref([]);
  const recentActivity = ref([]);
  const userData = ref(null);
  
  onMounted(async () => {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    userData.value = userDoc.data();
  
    const createdQuery = query(
      collection(db, 'projects'),
      where('createdBy.uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const createdSnap = await getDocs(createdQuery);
    createdProjects.value = createdSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
    const allProjectsSnap = await getDocs(collection(db, 'projects'));
    const interested = [];
    const activity = [];
  
    allProjectsSnap.forEach(docSnap => {
      const proj = docSnap.data();
      const isInterested = proj.interested?.some(u => u.uid === currentUser.uid);
      if (isInterested) interested.push({ id: docSnap.id, ...proj });
  
      proj.discussions?.forEach(disc => {
        activity.push({
          user: disc.user.displayName,
          content: disc.content,
          project: proj.title,
          time: disc.createdAt?.toDate(),
        });
      });
    });
  
    interestedProjects.value = interested;
    recentActivity.value = activity.sort((a, b) => b.time - a.time).slice(0, 5);
  });
  </script>
  
  <style scoped>
  .grid {
    display: grid;
    gap: 1rem;
  }
  </style>
  