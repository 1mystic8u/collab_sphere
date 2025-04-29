<template>
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">Welcome {{ currentUser?.displayName || 'User' }}</h1>
      </div>
  
      <!-- Your Projects Section -->
      <section class="dashboard-section">
        <h2 class="section-title">Your Projects</h2>
        <div class="project-cards">
          <!-- Created Projects -->
          <div v-if="createdProjects.length > 0" class="project-grid">
            <Card v-for="project in createdProjects" :key="project.id" class="project-card">
              <template #header>
                <div class="project-card-status">
                  <i :class="getProjectStatusIcon(project)"></i>
                  <span>{{ getProjectStatus(project) }}</span>
                </div>
              </template>
              <template #title>
                <div class="project-card-title">
                  <h3>{{ project.title || 'Untitled Project' }}</h3>
                </div>
              </template>
              <template #content>
                <p class="project-card-description">{{ project.description || 'No description provided.' }}</p>
              </template>
              <template #footer>
                <div class="project-card-actions">
                  <Button label="View Details" class="p-button-outlined p-button-primary" @click="viewProject(project.id)" />
                  <Button v-if="project.hasAnalytics" label="Analytics" class="p-button-text" @click="viewAnalytics(project.id)" />
                </div>
              </template>
            </Card>
          </div>
          <div v-else class="empty-state">
            <i class="pi pi-folder-open"></i>
            <p>You haven't created any projects yet.</p>
            <Button label="Create Your First Project" icon="pi pi-plus" class="p-button-primary" @click="goToCreateProject" />
          </div>
        </div>
      </section>
  
      <!-- Quick Stats Section -->
      <section class="dashboard-section">
        <h2 class="section-title">Quick Stats</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon users-icon">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-content">
              <h3>Active Users</h3>
              <span class="stat-value">{{ userData?.activeUsers || '0' }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon completed-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>Completed Projects</h3>
              <span class="stat-value">{{ userData?.completedProjects || '0' }}</span>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon pending-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-content">
              <h3>Pending Tasks</h3>
              <span class="stat-value">{{ userData?.pendingTasks || '0' }}</span>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Recent Activity Section -->
      <section class="dashboard-section">
        <h2 class="section-title">Recent Activity</h2>
        <div class="activity-list">
          <div v-if="recentActivity.length > 0">
            <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
              <Avatar :image="activity.userAvatar" :label="activity.user?.charAt(0) || '?'" shape="circle" />
              <div class="activity-content">
                <div class="activity-user">{{ activity.user }}</div>
                <div class="activity-action">{{ activity.action }}</div>
                <div class="activity-project">{{ activity.project }}</div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="pi pi-history"></i>
            <p>No recent activity.</p>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { db, auth } from '@/firebase';
  import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
  import Card from 'primevue/card';
  import Avatar from 'primevue/avatar';
  import Button from 'primevue/button';
  
  const router = useRouter();
  
  // Use Firebase Auth for current user
  const currentUser = ref(null);
  const createdProjects = ref([]);
  const interestedProjects = ref([]);
  const recentActivity = ref([]);
  const userData = ref(null);
  const loading = ref(true);
  
  onMounted(() => {
    // Listen to auth state changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        currentUser.value = { uid: user.uid, displayName: user.displayName };
        fetchUserData();
      } else {
        currentUser.value = null;
        // Handle logged out state, maybe redirect
        router.push('/login');
      }
      loading.value = false;
    });
  });
  
  const fetchUserData = async () => {
    if (!currentUser.value) return;
    loading.value = true;
  
    try {
      // Fetch User Data
      const userDoc = await getDoc(doc(db, 'users', currentUser.value.uid));
      if (userDoc.exists()) {
        userData.value = userDoc.data();
      } else {
        // Handle case where user doc might not exist yet
        userData.value = { displayName: currentUser.value.displayName };
      }
  
      // Fetch Created Projects
      const createdQuery = query(
        collection(db, 'projects'),
        where('createdBy.uid', '==', currentUser.value.uid),
        orderBy('createdAt', 'desc')
      );
      const createdSnap = await getDocs(createdQuery);
      createdProjects.value = createdSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // Add project status for the UI
      createdProjects.value = createdProjects.value.map(project => {
        // Add status based on project properties
        if (project.status) {
          return project;
        } else {
          // Default status - could be based on other properties
          const status = project.completed ? 'Completed' : 
                        project.draft ? 'Draft' : 'Active';
          return { ...project, status };
        }
      });
  
      // Fetch Interested Projects (more efficiently)
      if (userData.value?.interestedProjects?.length > 0) {
          const interestedIds = userData.value.interestedProjects;
          const interestedPromises = interestedIds.map(id => getDoc(doc(db, 'projects', id)));
          const interestedSnaps = await Promise.all(interestedPromises);
          interestedProjects.value = interestedSnaps
              .filter(snap => snap.exists())
              .map(snap => ({ id: snap.id, ...snap.data() }));
      } else {
          interestedProjects.value = [];
      }
  
      // Fetch dashboard statistics
      try {
        // Get active users count (total number of users in the users collection)
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const activeUsersCount = usersSnapshot.size;
        
        // Get all projects to calculate statistics
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const allProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Count completed projects (projects with status "Completed" or completed flag)
        const completedProjects = allProjects.filter(project => 
          project.status === 'Completed' || project.completed === true
        ).length;
        
        // Count pending tasks (from all projects)
        let pendingTasksCount = 0;
        allProjects.forEach(project => {
          // Check if project has tasks array
          if (project.tasks && Array.isArray(project.tasks)) {
            // Count tasks that are not completed
            pendingTasksCount += project.tasks.filter(task => !task.completed).length;
          }
        });
        
        // Store the stats in userData for display
        userData.value = {
          ...userData.value,
          activeUsers: activeUsersCount,
          completedProjects: completedProjects,
          pendingTasks: pendingTasksCount
        };
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
  
      // Fetch Recent Activity
      const activity = [];
      const projectIds = new Set([
          ...createdProjects.value.map(p => p.id),
          ...interestedProjects.value.map(p => p.id)
      ]);
  
      const allRelevantProjects = [...createdProjects.value, ...interestedProjects.value]
          .filter((project, index, self) => index === self.findIndex(p => p.id === project.id));
  
      allRelevantProjects.forEach(proj => {
          proj.discussions?.forEach(disc => {
              if (disc.createdAt && disc.user) {
                  activity.push({
                      user: disc.user.displayName,
                      action: 'Commented on',
                      project: proj.title,
                      projectId: proj.id,
                      time: disc.createdAt?.toDate ? disc.createdAt.toDate() : new Date(disc.createdAt),
                  });
              }
          });
      });
  
      // Sort activity by time and limit
      recentActivity.value = activity
          .sort((a, b) => b.time.getTime() - a.time.getTime())
          .slice(0, 5);
  
    } catch (error) {
        console.error("Error fetching user home data:", error);
        // Handle error state in UI if needed
    } finally {
        loading.value = false;
    }
  };
  
  // Helper methods for project cards
  const getProjectStatus = (project) => {
    return project.status || 'Active';
  };
  
  const getProjectStatusIcon = (project) => {
    const status = getProjectStatus(project).toLowerCase();
    switch (status) {
      case 'active':
        return 'pi pi-folder text-teal-500';
      case 'draft':
        return 'pi pi-file text-blue-500';
      case 'completed':
        return 'pi pi-check-circle text-green-500';
      default:
        return 'pi pi-folder text-teal-500';
    }
  };
  
  // Navigation functions
  const goToCreateProject = () => {
    router.push('/project/create');
  };
  
  const viewProject = (projectId) => {
    if (projectId) {
      router.push(`/project/${projectId}`);
    }
  };
  
  const viewAnalytics = (projectId) => {
    if (projectId) {
      router.push(`/project/${projectId}/analytics`);
    }
  };
  
  const exploreProjects = () => {
    router.push('/discover');
  };
  
  // Formatting helpers
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) { return 'Invalid Date'; }
  };
  
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp instanceof Date ? timestamp : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
      if (isNaN(date.getTime())) return 'Invalid Date';
  
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.round(diffMs / 1000);
      const diffMin = Math.round(diffSec / 60);
      const diffHour = Math.round(diffMin / 60);
      const diffDay = Math.round(diffHour / 24);
  
      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin} min ago`;
      if (diffHour < 24) return `${diffHour} hr ago`;
      if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) { return 'Invalid Date'; }
  };
  </script>
  
  <style scoped>
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background-color: #f8f9fa;
    min-height: 100vh;
  }
  
  .dashboard-header {
    margin-bottom: 2rem;
  }
  
  .dashboard-title {
    font-size: 2rem;
    font-weight: 700;
    color: #212529;
  }
  
  .dashboard-section {
    margin-bottom: 2.5rem;
  }
  
  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #212529;
    margin-bottom: 1.5rem;
  }
  
  /* Project Cards */
  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
  
  .project-card {
    background-color: #ffffff;
    border-radius: 0.5rem;
    overflow: hidden;
    height: 100%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s ease;
  }
  
  .project-card:hover {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  :deep(.project-card .p-card-title) {
    padding: 0;
  }
  
  :deep(.project-card .p-card-content) {
    padding: 1rem;
  }
  
  .project-card-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: #f0f9ff;
    color: #0ea5e9;
  }
  
  .project-card-title h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
  }
  
  .project-card-description {
    color: #6c757d;
    margin-bottom: 0;
    min-height: 3rem;
  }
  
  .project-card-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-start;
    padding: 0.5rem 1rem 1rem;
  }
  
  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  
  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    margin-right: 1rem;
  }
  
  .stat-icon i {
    font-size: 1.5rem;
    color: #ffffff;
  }
  
  .users-icon {
    background-color: #10b981;
  }
  
  .completed-icon {
    background-color: #3b82f6;
  }
  
  .pending-icon {
    background-color: #f59e0b;
  }
  
  .stat-content h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #6c757d;
    margin: 0 0 0.25rem 0;
  }
  
  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: #212529;
  }
  
  /* Activity List */
  .activity-list {
    background-color: #ffffff;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  
  .activity-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #f1f3f5;
  }
  
  .activity-item:last-child {
    border-bottom: none;
  }
  
  .activity-content {
    margin-left: 1rem;
  }
  
  .activity-user {
    font-weight: 600;
    color: #212529;
  }
  
  .activity-action {
    font-size: 0.875rem;
    color: #6c757d;
  }
  
  .activity-project {
    font-size: 0.875rem;
    color: #0ea5e9;
    font-weight: 500;
  }
  
  /* Empty states */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    background-color: #ffffff;
    border-radius: 0.5rem;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  
  .empty-state i {
    font-size: 2.5rem;
    color: #d1d5db;
    margin-bottom: 1rem;
  }
  
  .empty-state p {
    color: #6c757d;
    margin-bottom: 1.5rem;
  }
  </style>