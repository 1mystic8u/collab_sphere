<template>
  <div class="dashboard-container p-4">
    <!-- Header Section with Summary Stats -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Dashboard</h1>   
      
  
    </div>
    <br>

    <div v-if="loading" class="text-center p-8">
      <ProgressSpinner style="width:50px;height:50px" />
      <p class="mt-3 text-lg">Loading dashboard data...</p>
    </div>

    <div v-else-if="error" class="p-error text-center p-8 bg-red-50 rounded-lg">
      <i class="pi pi-exclamation-triangle text-3xl mb-2"></i>
      <p class="text-lg">Error loading dashboard data: {{ error }}</p>
      <Button label="Retry" icon="pi pi-refresh" class="mt-3" @click="loadDashboardData" />
    </div>

    <div class="out_encl" v-else>
      <!-- Welcome Card & Summary Stats -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
        <div class="top-cards">
          <Card class="lg:col-span-1 shadow-md bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <template #content>
              <div class="flex flex-col items-center justify-center p-2">
                <div class="rounded-full bg-white/30 p-3 mb-2">
                  <i class="pi pi-user text-3xl"></i>
                </div>
                <h2 class="text-xl font-bold mb-1">Welcome Back</h2>
                <p class="font-medium text-center">{{ user?.displayName || 'User' }}</p>
              </div>
            </template>
          </Card>

          
            <Card class="shadow-md hover:shadow-lg transition-shadow">
              <template #content>
                <div class="flex items-center">
                  <div class="bg-green-100 rounded-full p-3 mr-3">
                    <i class="pi pi-folder text-green-600 text-2xl"></i>
                  </div>
                  <div>
                    <div class="text-3xl font-bold">{{ myProjects.length }}</div>
                    <div class="text-sm text-gray-500">My Projects</div>
                  </div>
                </div>
              </template>
            </Card>

              <Card class="shadow-md hover:shadow-lg transition-shadow">
                <template #content>
                  <div class="flex items-center">
                    <div class="bg-orange-100 rounded-full p-3 mr-3">
                      <i class="pi pi-heart text-orange-600 text-2xl"></i>
                    </div>
                    <div>
                      <div class="text-3xl font-bold">{{ interestedProjects.length }}</div>
                      <div class="text-sm text-gray-500">Interests</div>
                    </div>
                  </div>
                </template>
              </Card>
         

            <Card class="shadow-md hover:shadow-lg transition-shadow">
              <template #content>
                <div class="flex items-center">
                  <div class="bg-blue-100 rounded-full p-3 mr-3">
                    <i class="pi pi-comments text-blue-600 text-2xl"></i>
                  </div>
                  <div>
                    <div class="text-3xl font-bold">{{ totalComments }}</div>
                    <div class="text-sm text-gray-500">Discussions</div>
                  </div>
                </div>
              </template>
            </Card>
          
        </div>
      </div>

      <!-- Activity Chart Section -->
      <div class="mb-6">
        <Card class="shadow-md">
          <template #title>
            <div class="flex justify-between items-center">
              <span>User Activity</span>
              <Dropdown 
                v-model="activityPeriod" 
                :options="activityPeriodOptions" 
                optionLabel="label" 
                optionValue="value" 
                placeholder="Select Period" 
                class="w-40"
              />
            </div>
          </template>
          <template #content>
            <Chart type="bar" :data="activityChartData" :options="activityChartOptions" class="h-72" />
          </template>
        </Card>
      </div>

      <!-- Main Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- My Projects Section -->
        <Card class="lg:col-span-2 shadow-md">
          <template #title>
            <div class="flex justify-between items-center">
              <span>My Projects ({{ myProjects.length }})</span>
              <div class="flex gap-2">
                <Button icon="pi pi-plus" class="p-button-sm p-button-outlined" @click="goToCreateProject" />
                <Button icon="pi pi-filter" class="p-button-sm p-button-outlined" v-tooltip.top="'Filter Projects'" />
              </div>
            </div>
          </template>
          <template #content>
            <DataTable 
              :value="myProjects" 
              :paginator="myProjects.length > 5" 
              :rows="5" 
              v-if="myProjects.length > 0"
              tableStyle="min-width: 100%"             
              class="p-datatable-sm"
            >
              <Column field="title" header="Project Name">
                <template #body="slotProps">
                  <div class="flex items-center cursor-pointer" @click="goToProjectDetails(slotProps.data.id)">
                    <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span class="font-medium">{{ slotProps.data.title || 'Untitled Project' }}</span>
                  </div>
                </template>
              </Column>
              <Column field="skills" header="Skills" class="hidden sm:table-cell">
                <template #body="slotProps">
                  <div class="flex flex-wrap gap-1">
                    <Chip v-for="skill in slotProps.data.skills?.slice(0, 2)" :key="skill" :label="skill" class="text-xs" />
                    <Chip v-if="slotProps.data.skills?.length > 2" :label="`+${slotProps.data.skills.length - 2}`" class="text-xs" />
                  </div>
                </template>
              </Column>
              <Column field="interested" header="Interested" class="hidden md:table-cell">
                <template #body="slotProps">
                  <div class="flex items-center">
                    <i class="pi pi-users mr-2 text-blue-500"></i>
                    <span>{{ slotProps.data.interested?.length || 0 }}</span>
                  </div>
                </template>
              </Column>
              <Column field="createdAt" header="Created" class="hidden lg:table-cell">
                <template #body="slotProps">
                  <span>{{ formatDate(slotProps.data.createdAt) }}</span>
                </template>
              </Column>
              <Column header="Actions" style="width: 80px">
                <template #body="slotProps">
                  <div class="flex gap-2">
                    <Button icon="pi pi-eye" class="p-button-text p-button-rounded p-button-sm" @click="goToProjectDetails(slotProps.data.id)" />
                  </div>
                </template>
              </Column>
              
            </DataTable>
             
            <div v-else class="text-center py-8">
              <i class="pi pi-folder-open text-4xl text-gray-300 mb-3"></i>
              <p class="text-gray-500">You haven't created any projects yet.</p>
              <Button label="Create Your First Project" icon="pi pi-plus" class="mt-3" @click="goToCreateProject" />
            </div>
          </template>
        </Card>
        <br>

        <!-- Right Side Content -->
        <div class="lg:col-span-1 flex flex-col gap-6">
          <!-- Projects by Skills Pie Chart -->
          <Card class="shadow-md">
            <template #title>Projects by Skills</template>
            <template #content>
              <Chart type="doughnut" :data="skillsChartData" :options="skillsChartOptions" class="h-64" />
            </template>
          </Card>
          <br>
          <!-- Interested Projects -->
          <Card class="shadow-md">
            <template #title>Interested Projects</template>
            <template #content>
              <div v-if="interestedProjects.length > 0">
                <ul class="list-none p-0 m-0">
                  <li v-for="project in interestedProjects.slice(0, 5)" :key="project.id" 
                      class="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      @click="goToProjectDetails(project.id)">
                    <div class="flex-1">
                      <div class="font-medium">{{ project.title }}</div>
                      <div class="text-sm text-gray-500">by {{ project.createdBy?.displayName }}</div>
                    </div>
                    <Badge :value="project.discussions?.length || 0" severity="info" class="mr-2"></Badge>
                    <Button icon="pi pi-angle-right" class="p-button-text p-button-rounded p-button-sm" />
                  </li>
                </ul>
                <div v-if="interestedProjects.length > 5" class="text-center mt-3">
                  <Button label="View All" icon="pi pi-arrow-right" iconPos="right" class="p-button-text p-button-sm" />
                </div>
              </div>
              <div v-else class="text-center py-6">
                <i class="pi pi-search text-3xl text-gray-300 mb-2"></i>
                <p class="text-gray-500">No interests yet. Explore projects to find collaborations.</p>
                <Button label="Explore Projects" icon="pi pi-compass" class="mt-3 p-button-outlined" />
              </div>
            </template>
          </Card>
        </div>
      </div>
      
      <!-- Recent Activity and Discussions Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <!-- Recent Activity Timeline -->
        <Card class="shadow-md">
          <template #title>Recent Activity</template>
          <template #content>
            <Timeline :value="recentActivity" class="w-full">
              <template #content="slotProps">
                <div class="flex flex-col">
                  <small class="text-gray-500">{{ formatTimeAgo(slotProps.item.time) }}</small>
                  <div class="text-sm my-1">{{ slotProps.item.description }}</div>
                  <div v-if="slotProps.item.link" 
                      class="text-xs text-blue-600 cursor-pointer hover:underline"
                      @click="navigateTo(slotProps.item.link)">
                    View details
                  </div>
                </div>
              </template>
              <template #opposite="slotProps">
                <div class="flex justify-center items-center w-10 h-10 rounded-full" 
                      :class="getActivityIconClass(slotProps.item.type)">
                  <i :class="getActivityIcon(slotProps.item.type)"></i>
                </div>
              </template>
            </Timeline>
          </template>
        </Card>
        <br>
        <!-- Recent Discussions -->
        <Card class="shadow-md">
          <template #title>Recent Discussions</template>
          <template #content>
            <div v-if="recentDiscussions.length > 0">
              <div v-for="(discussion, index) in recentDiscussions" :key="index"
                  class="border-b border-gray-100 last:border-b-0 py-3">
                <div class="flex items-start">
                  <Avatar :label="discussion.user.displayName.charAt(0)" class="mr-3" size="large" />
                  <div>
                    <div class="flex items-center">
                      <span class="font-medium">{{ discussion.user.displayName }}</span>
                      <span class="text-xs text-gray-500 ml-3">in {{ discussion.projectTitle }}</span>
                    </div>
                    <p class="my-1 text-sm">{{ discussion.content }}</p>
                    <small class="text-gray-500 italic">{{ formatTimeAgo(discussion.createdAt) }}</small>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6">
              <i class="pi pi-comments text-3xl text-gray-300 mb-2"></i>
              <p class="text-gray-500">No recent discussions.</p>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase'; // Adjust path if needed
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';

// PrimeVue Components
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Chip from 'primevue/chip';
import Badge from 'primevue/badge';
import Chart from 'primevue/chart';
import Timeline from 'primevue/timeline';
import Avatar from 'primevue/avatar';
import Dropdown from 'primevue/dropdown';
import Tooltip from 'primevue/tooltip';

const router = useRouter();
const user = ref(null);
const myProjects = ref([]);
const interestedProjects = ref([]);
const loading = ref(true);
const error = ref(null);
const recentActivity = ref([]);
const recentDiscussions = ref([]);
const totalComments = ref(0);

// Activity chart state
const activityPeriod = ref('week');
const activityPeriodOptions = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' }
];

// Load dashboard data
const loadDashboardData = async () => {
  loading.value = true;
  error.value = null;
  const currentUser = auth.currentUser;

  if (!currentUser) {
    router.push('/login');
    return;
  }

  user.value = currentUser;

  try {
    // Fetch projects created by the user
    const myProjectsQuery = query(
      collection(db, 'projects'), 
      where('createdBy.uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const myProjectsSnapshot = await getDocs(myProjectsQuery);
    myProjects.value = myProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch user's interested projects
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      const interestedProjectIds = userData.interestedProjects || [];

      if (interestedProjectIds.length > 0) {
        const projectPromises = interestedProjectIds.map(id => getDoc(doc(db, 'projects', id)));
        const projectSnapshots = await Promise.all(projectPromises);
        interestedProjects.value = projectSnapshots
          .filter(snap => snap.exists())
          .map(snap => ({ id: snap.id, ...snap.data() }));
      }
    }

    // Generate recent activity (in a real app, you'd fetch this from Firestore)
    generateRecentActivity();
    
    // Extract recent discussions from all projects
    extractRecentDiscussions();
    
    // Calculate total comments/discussions
    calculateTotalComments();

  } catch (err) {
    console.error("Error loading dashboard data:", err);
    error.value = err.message || 'Failed to load data.';
  } finally {
    loading.value = false;
  }
};

// Calculate total number of comments across all projects
const calculateTotalComments = () => {
  let count = 0;
  myProjects.value.forEach(project => {
    count += project.discussions?.length || 0;
  });
  interestedProjects.value.forEach(project => {
    count += project.discussions?.length || 0;
  });
  totalComments.value = count;
};

// Extract recent discussions from all projects
const extractRecentDiscussions = () => {
  const discussions = [];
  
  // From my projects
  myProjects.value.forEach(project => {
    if (project.discussions?.length) {
      project.discussions.forEach(discussion => {
        discussions.push({
          ...discussion,
          projectId: project.id,
          projectTitle: project.title
        });
      });
    }
  });
  
  // From interested projects
  interestedProjects.value.forEach(project => {
    if (project.discussions?.length) {
      project.discussions.forEach(discussion => {
        discussions.push({
          ...discussion,
          projectId: project.id,
          projectTitle: project.title
        });
      });
    }
  });
  
  // Sort by date (newest first) and take the most recent 5
  discussions.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
  recentDiscussions.value = discussions.slice(0, 5);
};

// Generate sample activity for the timeline
const generateRecentActivity = () => {
  const activities = [];
  
  // Add activities based on actual projects
  if (myProjects.value.length > 0) {
    myProjects.value.slice(0, 3).forEach(project => {
      activities.push({
        type: 'create',
        description: `You created project "${project.title}"`,
        time: project.createdAt,
        link: `/project/${project.id}`
      });
    });
  }
  
  // Add activities based on interested projects
  if (interestedProjects.value.length > 0) {
    interestedProjects.value.slice(0, 2).forEach(project => {
      activities.push({
        type: 'interest',
        description: `You expressed interest in "${project.title}"`,
        time: project.createdAt, // Ideally, you'd track when interest was expressed
        link: `/project/${project.id}`
      });
    });
  }
  
  // Add discussion activities
  if (recentDiscussions.value.length > 0) {
    recentDiscussions.value.slice(0, 2).forEach(discussion => {
      activities.push({
        type: 'comment',
        description: `${discussion.user.displayName} commented on "${discussion.projectTitle}"`,
        time: discussion.createdAt,
        link: `/project/${discussion.projectId}`
      });
    });
  }
  
  // Sort by time (newest first)
  activities.sort((a, b) => b.time?.toMillis() - a.time?.toMillis());
  recentActivity.value = activities.slice(0, 5);
};

// Helper functions for timeline
const getActivityIcon = (type) => {
  switch (type) {
    case 'create': return 'pi pi-plus';
    case 'interest': return 'pi pi-heart';
    case 'comment': return 'pi pi-comment';
    default: return 'pi pi-circle';
  }
};

const getActivityIconClass = (type) => {
  switch (type) {
    case 'create': return 'bg-green-100 text-green-600';
    case 'interest': return 'bg-red-100 text-red-600';
    case 'comment': return 'bg-blue-100 text-blue-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

// Navigation functions
const goToCreateProject = () => {
  router.push('/project/create');
};

const goToAllProjects = () => {
  router.push('/projects');
};

const goToProjectDetails = (projectId) => {
  router.push(`/project/${projectId}`);
};

const navigateTo = (path) => {
  router.push(path);
};

// Chart data
const activityChartData = computed(() => {
  // In a real app, you would fetch actual data
  return {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Activity',
        backgroundColor: '#10b981',
        data: [25, 40, 30, 50, 35, 20, 30, 40, 50, 30, 45, 30]
      }
    ]
  };
});

const activityChartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      grid: {
        display: true,
        color: '#f3f4f6'
      },
      ticks: {
        font: {
          size: 10
        }
      },
      beginAtZero: true
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 10
        }
      }
    }
  }
};

// Skills doughnut chart data
const skillsChartData = computed(() => {
  // Extract all skills from projects and count occurrences
  const skillsMap = {};
  myProjects.value.forEach(project => {
    if (project.skills?.length) {
      project.skills.forEach(skill => {
        skillsMap[skill] = (skillsMap[skill] || 0) + 1;
      });
    }
  });
  
  // Convert to chart format
  const labels = Object.keys(skillsMap);
  const data = Object.values(skillsMap);
  const backgroundColors = [
    '#4ade80', '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', 
    '#34d399', '#38bdf8', '#fb7185', '#facc15', '#818cf8'
  ];
  
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors.slice(0, data.length),
        hoverBackgroundColor: backgroundColors.slice(0, data.length).map(color => color + 'dd')
      }
    ]
  };
});

const skillsChartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        boxWidth: 10,
        font: {
          size: 10
        }
      }
    }
  },
  cutout: '70%'
};

// Formatting helpers
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
  } else if (diffHour > 0) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else if (diffMin > 0) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Load data on component mount
onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>

.out_encl {
 display: flex;
  flex-direction: column;
    gap: 1rem;
}

.top-cards {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

:deep(.p-card) {
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.p-card .p-card-content) {
  padding: 1rem;
}

:deep(.p-card .p-card-title) {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem;
  margin-bottom: 0;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.p-timeline-event-opposite) {
  flex: 0;
  padding-right: 1rem;
}

:deep(.p-dropdown .p-dropdown-label) {
  font-size: 0.875rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

:deep(.p-datatable .p-paginator) {
  padding: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  :deep(.p-card .p-card-title) {
    font-size: 1rem;
    padding: 0.75rem;
  }
  
  :deep(.p-card .p-card-content) {
    padding: 0.75rem;
  }
}
</style>