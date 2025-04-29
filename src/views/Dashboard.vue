```vue
<template>
  <div class="dashboard-container">
    <!-- Header Section with Summary Stats -->
    <div class="dashboard-header">
      <h1>Dashboard</h1>
    </div>

    <div class="loading-container" v-if="loading">
      <ProgressSpinner />
      <p>Loading dashboard data...</p>
    </div>

    <div class="error-container" v-else-if="error">
      <i class="pi pi-exclamation-triangle"></i>
      <p>Error loading dashboard data: {{ error }}</p>
      <Button label="Retry" icon="pi pi-refresh" @click="loadDashboardData" />
    </div>

    <div class="dashboard-content" v-else>
      <!-- Summary Stats Cards -->
      <div class="summary-stats">
        <Card class="welcome-card">
          <template #content>
            <div class="welcome-content">
              <div class="icon-circle">
                <i class="pi pi-user"></i>
              </div>
              <h2>Welcome Back</h2>
              <p>{{ user?.displayName || 'User' }}</p>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="stat-item">
              <div class="stat-icon">
                <i class="pi pi-folder"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ myProjects.length }}</div>
                <div class="stat-label">My Projects</div>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="stat-item">
              <div class="stat-icon">
                <i class="pi pi-heart"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ interestedProjects.length }}</div>
                <div class="stat-label">Interests</div>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #content>
            <div class="stat-item">
              <div class="stat-icon">
                <i class="pi pi-comments"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalComments }}</div>
                <div class="stat-label">Discussions</div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Activity Chart Section -->
      <div class="chart-section">
        <Card>
          <template #title>
            <div class="card-header">
              <span>User Activity</span>
              <Dropdown 
                v-model="activityPeriod" 
                :options="activityPeriodOptions" 
                optionLabel="label" 
                optionValue="value" 
                placeholder="Select Period"
              />
            </div>
          </template>
          <template #content>
            <Chart type="bar" :data="activityChartData" :options="activityChartOptions" />
          </template>
        </Card>
      </div>

      <!-- Main Content Area -->
      <div class="main_content">
        <!-- My Projects Section -->
        <div class="projects-section" style="width: 100%;">
          <Card style="width: 100%;">
        <template #title>
          <div class="card-header">
          <span>My Projects ({{ myProjects.length }})</span>
          <div class="action-buttons">
        <Button icon="pi pi-plus" class="p-button-outlined" @click="goToCreateProject" />
        <Button icon="pi pi-filter" class="p-button-outlined" v-tooltip.top="'Filter Projects'" />
          </div>
          </div>
        </template>
        <template #content>
          <DataTable 
          :value="myProjects" 
          :paginator="myProjects.length > 5" 
          :rows="5" 
          v-if="myProjects.length > 0"
          style="width: 100%;"
          >
          <Column field="title" header="Project Name">
        <template #body="slotProps">
          <div class="project-name" @click="goToProjectDetails(slotProps.data.id)">
            <div class="status-indicator"></div>
            <span>{{ slotProps.data.title || 'Untitled Project' }}</span>
          </div>
        </template>
          </Column>
          <Column field="skills" header="Skills" class="skills-column">
        <template #body="slotProps">
          <div class="skills-wrapper">
            <Chip v-for="skill in slotProps.data.skills?.slice(0, 2)" :key="skill" :label="skill" />
            <Chip v-if="slotProps.data.skills?.length > 2" :label="`+${slotProps.data.skills.length - 2}`" />
          </div>
        </template>
          </Column>
          <Column field="interested" header="Interested" class="interested-column">
        <template #body="slotProps">
          <div class="interested-count">
            <i class="pi pi-users"></i>
            <span>{{ slotProps.data.interested?.length || 0 }}</span>
          </div>
        </template>
          </Column>
          <Column field="createdAt" header="Created" class="date-column">
        <template #body="slotProps">
          <span>{{ formatDate(slotProps.data.createdAt) }}</span>
        </template>
          </Column>
          <Column header="Actions">
        <template #body="slotProps">
          <div class="action-buttons">
            <Button icon="pi pi-eye" class="p-button-text p-button-rounded" @click="goToProjectDetails(slotProps.data.id)" />
          </div>
        </template>
          </Column>
          </DataTable>
           
          <div class="empty-state" v-else>
          <i class="pi pi-folder-open"></i>
          <p>You haven't created any projects yet.</p>
          <Button label="Create Your First Project" icon="pi pi-plus" @click="goToCreateProject" />
          </div>
        </template>
          </Card>
        </div>

        <!-- Projects by Skills Pie Chart -->
        <Card class="skills-chart-card" style="width: 100%;">
          <template #title>Projects by Skills</template>
          <template #content>
        <Chart type="doughnut" :data="skillsChartData" :options="skillsChartOptions" />
          </template>
        </Card>

        <!-- Interested Projects -->
        <Card class="interested-projects-card" style="width: 100%;">
          <template #title>Interested Projects</template>
          <template #content>
        <div v-if="interestedProjects.length > 0">
          <ul class="interested-list">
            <li 
          v-for="project in interestedProjects.slice(0, 5)" 
          :key="project.id" 
          class="interested-item"
          @click="goToProjectDetails(project.id)"
            >
          <div class="project-info">
            <div class="project-title">{{ project.title }}</div>
            <div class="project-author">by {{ project.createdBy?.displayName }}</div>
          </div>
          <Badge :value="project.discussions?.length || 0" severity="info"></Badge>
          <Button icon="pi pi-angle-right" class="p-button-text p-button-rounded" />
            </li>
          </ul>
          <div class="view-all" v-if="interestedProjects.length > 5">
            <Button label="View All" icon="pi pi-arrow-right" iconPos="right" class="p-button-text" />
          </div>
        </div>
        <div class="empty-state" v-else>
          <i class="pi pi-search"></i>
          <p>No interests yet. Explore projects to find collaborations.</p>
          <Button label="Explore Projects" icon="pi pi-compass" class="p-button-outlined" />
        </div>
          </template>
        </Card>
      </div>

      
      <!-- Recent Activity and Discussions Section -->
      <div class="activity-discussion">
        <!-- Recent Activity Timeline -->
        <Card class="activity-card">
          <template #title>Recent Activity</template>
          <template #content>
        <Timeline :value="recentActivity" >
          <template #content="slotProps">
            <div class="timeline-content">
          <small>{{ formatTimeAgo(slotProps.item.time) }}</small>
          <div class="timeline-description">{{ slotProps.item.description }}</div>
          <div 
            v-if="slotProps.item.link" 
            class="timeline-link"
            @click="navigateTo(slotProps.item.link)"
          >
            View details
          </div>
            </div>
          </template>
          <template #marker="slotProps">
            <div class="timeline-icon" :class="getActivityIconClass(slotProps.item.type)">
          <i :class="getActivityIcon(slotProps.item.type)"></i>
            </div>
          </template>
        </Timeline>
          </template>
        </Card>

        <!-- Recent Discussions -->
        <Card class="discussions-card">
          <template #title>Recent Discussions</template>
          <template #content>
            <div v-if="recentDiscussions.length > 0">
              <div v-for="(discussion, index) in recentDiscussions" :key="index" class="discussion-item">
                <div class="discussion-content">
                  <Avatar :label="discussion.user.displayName.charAt(0)" class="discussion-avatar" />
                  <div class="discussion-details">
                    <div class="discussion-header">
                      <span class="user-name">{{ discussion.user.displayName }}</span>
                      <span class="project-reference">in {{ discussion.projectTitle }}</span>
                    </div>
                    <p class="discussion-text">{{ discussion.content }}</p>
                    <small class="discussion-time">{{ formatTimeAgo(discussion.createdAt) }}</small>
                  </div>
                </div>
              </div>
            </div>
            <div class="empty-state" v-else>
              <i class="pi pi-comments"></i>
              <p>No recent discussions.</p>
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
    case 'create': return 'create-activity';
    case 'interest': return 'interest-activity';
    case 'comment': return 'comment-activity';
    default: return 'default-activity';
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
/* Base Styles */
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #333;
}

.loading-container,
.error-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loading-container p,
.error-container p {
  margin-top: 0.75rem;
  font-size: 1.125rem;
}

.error-container i {
  font-size: 2rem;
  color: #ef4444;
  margin-bottom: 0.5rem;
}

.error-container button {
  margin-top: 0.75rem;
}

/* Summary Stats Section */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.welcome-card {
  background: linear-gradient(to right, #4f46e5, #3b82f6);
  color: white;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  text-align: center;
}

.icon-circle {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.icon-circle i {
  font-size: 1.5rem;
}

.welcome-content h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  background-color: #e0f2fe;
  border-radius: 50%;
  padding: 0.75rem;
  margin-right: 0.75rem;
}

.stat-icon i {
  font-size: 1.25rem;
  color: #0ea5e9;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Chart Section */
.chart-section {
  margin-bottom: 1.5rem;
}

.chart-section :deep(.p-card-content) {
  height: 18rem;
}

/* Card Header Styles */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Main Content Grid */
.main_content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Projects Table Styles */
.project-name {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #10b981;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.skills-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.interested-count {
  display: flex;
  align-items: center;
}

.interested-count i {
  color: #3b82f6;
  margin-right: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* Empty State Styling */
.empty-state {
  padding: 2rem 0;
}

.empty-state i {
  font-size: 2.5rem;
  color: #d1d5db;
  margin-bottom: 0.75rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 0.75rem;
}

/* Interested Projects List */
.interested-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.interested-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.interested-item:hover {
  background-color: #f9fafb;
}

.interested-item:last-child {
  border-bottom: none;
}

.project-info {
  flex: 1;
}

.project-title {
  font-weight: 500;
}

.project-author {
  font-size: 0.75rem;
  color: #6b7280;
}

.view-all {
  text-align: center;
  margin-top: 0.75rem;
}

/* Activity & Discussions Grid */
.activity-discussion {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* Timeline Styling */
.activity-card :deep(.p-card-content) {
  padding: 1rem;
}

/* Style the timeline marker */
:deep(.p-timeline .p-timeline-event-marker) {
    border: none; /* Remove default border */
    position: relative; /* Ensure marker is positioned correctly */
    /* Adjust left position if needed based on alignment */
}

/* Style the timeline connector */
:deep(.p-timeline .p-timeline-event-connector) {
    background-color: #e5e7eb; /* gray-200 */
    width: 2px;
}

/* Hide the opposite content area for left/right alignment */
:deep(.p-timeline-left .p-timeline-event-opposite),
:deep(.p-timeline-right .p-timeline-event-opposite) {
    display: none; /* Completely hide the opposite div */
}

/* Adjust content padding when opposite is hidden */
:deep(.p-timeline-left .p-timeline-event-content),
:deep(.p-timeline-right .p-timeline-event-content) {
    padding-left: 1rem; /* Ensure consistent padding */
    padding-right: 0; /* Remove padding on the side where opposite used to be */
}

.timeline-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.25rem; /* Slightly smaller */
  height: 2.25rem;
  border-radius: 50%;
  margin-top: 0.25rem; /* Align better with text */
  z-index: 1; /* Ensure marker is above connector */
}

.create-activity {
  background-color: #dcfce7;
  color: #16a34a;
}

.interest-activity {
  background-color: #fee2e2;
  color: #dc2626;
}

.comment-activity {
  background-color: #dbeafe;
  color: #2563eb;
}

.default-activity {
  background-color: #f3f4f6;
  color: #6b7280;
}

.timeline-content {
  display: flex;
  flex-direction: column;
}

.timeline-description {
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.timeline-link {
  font-size: 0.75rem;
  color: #3b82f6;
  cursor: pointer;
}

.timeline-link:hover {
  text-decoration: underline;
}

/* Discussion Item Styling */
.discussion-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.discussion-item:last-child {
  border-bottom: none;
}

.discussion-content {
  display: flex;
}

.discussion-avatar {
  margin-right: 0.75rem;
}

.discussion-details {
  flex: 1;
}

.discussion-header {
  display: flex;
  align-items: center;
}

.user-name {
  font-weight: 500;
}

.project-reference {
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.75rem;
}

.discussion-text {
  margin: 0.25rem 0;
  font-size: 0.875rem;
}

.discussion-time {
  color: #6b7280;
  font-style: italic;
}

/* Card Styles */
:deep(.p-card) {
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

:deep(.p-card:hover) {
  box-shadow: 0 4px 6px -1px rgba(0,  0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

</style>
```