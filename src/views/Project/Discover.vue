<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';

const router = useRouter();
const projects = ref([]);
const searchQuery = ref('');
const loading = ref(true);
const isLoggedIn = ref(false);
const selectedSkills = ref([]); 
const availableSkills = ref([]);

onMounted(async () => {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user;
  });
  
  await fetchProjects();
});

const fetchProjects = async () => {
  loading.value = true;
  availableSkills.value = [];
  try {
    const projectsQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(projectsQuery);
    
    const projectsData = [];
    const allSkills = new Set();
    querySnapshot.forEach((doc) => {
      const projectData = {
        id: doc.id,
        ...doc.data()
      };
      projectsData.push(projectData);
      if (projectData.skills && Array.isArray(projectData.skills)) {
        projectData.skills.forEach(skill => allSkills.add(skill));
      }
    });
    
    projects.value = projectsData;
    availableSkills.value = Array.from(allSkills).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  } catch (error) {
    console.error('Error fetching projects:', error);
  } finally {
    loading.value = false;
  }
};

const filteredProjects = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const skillsToFilter = selectedSkills.value;

  let filtered = projects.value;

  if (query) {
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      (project.skills && project.skills.some(skill => skill.toLowerCase().includes(query))) || 
      (project.createdBy && project.createdBy.displayName.toLowerCase().includes(query)) 
    );
  }

  if (skillsToFilter.length > 0) {
    filtered = filtered.filter(project => {
      if (!project.skills || !Array.isArray(project.skills)) {
        return false; 
      }
      const projectSkillsLower = project.skills.map(s => s.toLowerCase());
      return skillsToFilter.every(filterSkill =>
        projectSkillsLower.includes(filterSkill.toLowerCase())
      );
    });
  }

  return filtered;
});
</script>

<template>
  <div class="discover-container">
    <div class="discover-header">
      <h1>Discover Projects</h1>
      <div class="header-actions">
        <InputText v-model="searchQuery" placeholder="Search projects..." class="search-input" />
        <MultiSelect
          v-model="selectedSkills"
          :options="availableSkills"
          placeholder="Filter by skills..."
          display="chip"
          filter
          class="skills-filter"
        />
        <Button v-if="isLoggedIn" label="Create Project" icon="pi pi-plus" @click="router.push('/create-project')" />
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Loading projects...</p>
    </div>
    
    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <p>No projects found. Be the first to create one!</p>
      <Button v-if="isLoggedIn" label="Create Project" icon="pi pi-plus" @click="router.push('/create-project')" />
    </div>
    
    <div v-else class="projects-grid">
      <Card v-for="project in filteredProjects" :key="project.id" class="project-card">
        <template #title>
          <h3>{{ project.title }}</h3>
        </template>
        <template #subtitle>
          <div class="card-subtitle">
            <span>Created by: {{ project.createdBy.displayName }}</span>
          </div>
        </template>
        <template #content>
          <p class="project-description">{{ project.description }}</p>
          <div class="skills-container">
            <Chip v-for="skill in project.skills" :key="skill" :label="skill" class="skill-chip" />
          </div>
          <div class="card-footer">
            <div class="interest-section">
              <i class="pi pi-users"></i>
              <span>{{ project.interested.length }} interested</span>
            </div>
            <Button label="View Details" @click="router.push(`/project/${project.id}`)" />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.discover-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.discover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  width: 240px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.project-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.project-description {
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.skill-chip {
  background-color: #ecfdf5;
  color: #10b981;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.interest-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .discover-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>