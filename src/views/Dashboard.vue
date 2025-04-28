<template>
    <div class="dashboard-container p-4">
      <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
  
      <div v-if="loading" class="text-center">
        <ProgressSpinner />
        <p>Loading dashboard data...</p>
      </div>
  
      <div v-else-if="error" class="p-error text-center">
        <p>Error loading dashboard data: {{ error }}</p>
      </div>
  
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Welcome Card -->
        <Card class="col-span-1 md:col-span-2 lg:col-span-3">
          <template #title>Welcome, {{ user?.displayName || 'User' }}!</template>
          <template #content>
            <p>Here's an overview of your activity on Collab-Sphere.</p>
            <Button label="Create New Project" icon="pi pi-plus" class="mt-4" @click="goToCreateProject" />
          </template>
        </Card>
  
        <!-- My Projects Card -->
        <Card>
          <template #title>My Projects ({{ myProjects.length }})</template>
          <template #content>
            <DataView :value="myProjects" layout="list" v-if="myProjects.length > 0">
              <template #list="slotProps">
                <div class="col-12">
                  <div class="flex flex-col xl:flex-row xl:items-start p-4 gap-4 cursor-pointer hover:bg-gray-100" @click="goToProjectDetails(slotProps.data?.id)">
                    <div class="flex flex-col sm:flex-row justify-between items-center xl:items-start flex-1 gap-4">
                      <div class="flex flex-col items-center sm:items-start gap-3">
                        <div class="text-lg font-bold text-900">{{ slotProps.data?.title || 'Untitled Project' }}</div>
                        <div class="flex items-center gap-3">
                          <span class="flex items-center gap-2">
                            <i class="pi pi-tag"></i>
                            <span class="font-semibold">{{ slotProps.data?.skills?.length || 0 }} skills</span>
                          </span>
                        </div>
                      </div>
                      <div class="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                        <span class="text-sm text-gray-500">{{ formatDate(slotProps.data?.createdAt) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </DataView>
            <p v-else>You haven't created any projects yet.</p>
          </template>
        </Card>
  
        <!-- Interested Projects Card -->
        <Card>
          <template #title>Interested Projects ({{ interestedProjects.length }})</template>
          <template #content>
             <DataView :value="interestedProjects" layout="list" v-if="interestedProjects.length > 0">
               <template #list="slotProps">
                 <div class="col-12">
                   <div class="flex flex-col xl:flex-row xl:items-start p-4 gap-4 cursor-pointer hover:bg-gray-100" @click="goToProjectDetails(slotProps.data?.id)">
                     <div class="flex flex-col sm:flex-row justify-between items-center xl:items-start flex-1 gap-4">
                       <div class="flex flex-col items-center sm:items-start gap-3">
                         <div class="text-lg font-bold text-900">{{ slotProps.data?.title || 'Untitled Project' }}</div>
                         <div class="text-sm text-gray-600">by {{ slotProps.data?.createdBy?.displayName || 'Unknown' }}</div>
                       </div>
                       <div class="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                         <span class="text-sm text-gray-500">{{ formatDate(slotProps.data?.createdAt) }}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </template>
             </DataView>
            <p v-else>You haven't expressed interest in any projects yet.</p>
          </template>
        </Card>
  
        <!-- Placeholder for future cards -->
         <Card class="lg:col-span-1">
            <template #title>Activity Feed</template>
            <template #content>
                <p>Recent activity will appear here (coming soon).</p>
            </template>
        </Card>
  
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { auth, db } from '../firebase'; // Adjust path if needed
  import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
  import Card from 'primevue/card';
  import Button from 'primevue/button';
  import ProgressSpinner from 'primevue/progressspinner';
  import DataView from 'primevue/dataview';
  
  const router = useRouter();
  const user = ref(null);
  const myProjects = ref([]);
  const interestedProjects = ref([]);
  const loading = ref(true);
  const error = ref(null);
  
  onMounted(async () => {
    loading.value = true;
    error.value = null;
    const currentUser = auth.currentUser;
  
    if (!currentUser) {
      // Should ideally be handled by router guards, but good to double-check
      router.push('/login');
      return;
    }
  
    user.value = currentUser;
  
    try {
      // Fetch projects created by the user
      const myProjectsQuery = query(collection(db, 'projects'), where('createdBy.uid', '==', currentUser.uid));
      const myProjectsSnapshot = await getDocs(myProjectsQuery);
      myProjects.value = myProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // Fetch projects the user is interested in
      // First, get the user's document to find interested project IDs
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const interestedProjectIds = userData.interestedProjects || [];
  
        if (interestedProjectIds.length > 0) {
          // Fetch details for each interested project
          // Note: Firestore 'in' query is limited to 10 items. For more, fetch individually or use backend function.
          // For simplicity, fetching individually here. Consider optimization for large lists.
          const projectPromises = interestedProjectIds.map(id => getDoc(doc(db, 'projects', id)));
          const projectSnapshots = await Promise.all(projectPromises);
          interestedProjects.value = projectSnapshots
            .filter(snap => snap.exists())
            .map(snap => ({ id: snap.id, ...snap.data() }));
        }
      }
  
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      error.value = err.message || 'Failed to load data.';
    } finally {
      loading.value = false;
    }
  });
  
  const goToCreateProject = () => {
    router.push('/project/create');
  };
  
  const goToProjectDetails = (projectId) => {
    router.push(`/project/${projectId}`);
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp); // Handle both Firestore Timestamps and JS Dates
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  </script>
  
  <style scoped>
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  /* Add custom styles for cards or layout if needed */
  .p-card {
    height: 100%; /* Make cards fill grid cell height */
  }
  
  .p-dataview .p-dataview-content {
    background: none;
    padding: 0;
  }
  
  .hover\\:bg-gray-100:hover {
     background-color: #f3f4f6; /* Tailwind gray-100 */
  }
  
  .cursor-pointer {
      cursor: pointer;
  }
  </style>