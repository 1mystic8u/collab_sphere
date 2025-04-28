<template>
    <div class="create-project-container">
      <Card>
        <template #title>
          <h2>Create a New Project</h2>
        </template>
        <template #content>
          <form @submit.prevent="handleCreateProject">
            <div class="form-group">
              <label for="title">Project Title</label>
              <InputText 
                id="title" 
                v-model="projectData.title" 
                required
                class="w-full"
              />
            </div>
            
            <div class="form-group">
              <label for="description">Project Description</label>
              <Textarea 
                id="description" 
                v-model="projectData.description" 
                rows="5" 
                required
                class="w-full"
              />
            </div>
            
            <div class="form-group">
              <label>Required Skills</label>
              <div class="skills-input-container">
                <div class="selected-skills">
                  <Chip 
                    v-for="skill in projectData.skills" 
                    :key="skill" 
                    :label="skill" 
                    class="skill-chip"
                    removable 
                    @remove="removeSkill(skill)" 
                  />
                </div>
                <div class="add-skill-input">
                  <InputText 
                    v-model="newSkill" 
                    placeholder="Add skill (e.g., React, Node.js)"
                    @keydown.enter.prevent="addSkill"
                    class="w-full"
                  />
                  <Button 
                    type="button" 
                    icon="pi pi-plus" 
                    @click="addSkill"
                    class="p-button-rounded p-button-text"
                  />
                </div>
              </div>
            </div>
            
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            
            <div class="form-actions">
              <Button 
                type="button" 
                label="Cancel" 
                class="p-button-outlined" 
                @click="router.push('/discover')"
              />
              <Button 
                type="submit" 
                label="Create Project" 
                :loading="loading"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { auth, db } from '../../firebase';
  import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
  
  const router = useRouter();
  const projectData = reactive({
    title: '',
    description: '',
    skills: []
  });
  const newSkill = ref('');
  const errorMessage = ref('');
  const loading = ref(false);
  
  const addSkill = () => {
    const skill = newSkill.value.trim();
    if (skill && !projectData.skills.includes(skill)) {
      projectData.skills.push(skill);
      newSkill.value = '';
    }
  };
  
  const removeSkill = (skillToRemove) => {
    projectData.skills = projectData.skills.filter(skill => skill !== skillToRemove);
  };
  
  const handleCreateProject = async () => {
    if (!auth.currentUser) {
      errorMessage.value = 'You must be logged in to create a project';
      return;
    }
    
    if (projectData.skills.length === 0) {
      errorMessage.value = 'Please add at least one required skill';
      return;
    }
    
    loading.value = true;
    errorMessage.value = '';
    
    try {
      const currentUser = auth.currentUser;
      
      // Add project to Firestore
      const projectRef = await addDoc(collection(db, 'projects'), {
        title: projectData.title,
        description: projectData.description,
        skills: projectData.skills,
        createdAt: new Date(),
        createdBy: {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Anonymous'
        },
        interested: [],
        discussions: []
      });
      
      // Update user's createdProjects array
      await updateDoc(doc(db, 'users', currentUser.uid), {
        createdProjects: arrayUnion(projectRef.id)
      });
      
      router.push(`/project/${projectRef.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      errorMessage.value = 'Failed to create project. Please try again.';
    } finally {
      loading.value = false;
    }
  };
  </script>
  
  <style scoped>
  .create-project-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .skills-input-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .selected-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .skill-chip {
    background-color: #ecfdf5;
    color: #10b981;
  }
  
  .add-skill-input {
    display: flex;
    gap: 0.5rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .error-message {
    color: #ef4444;
    margin-top: 0.5rem;
  }
  
  .w-full {
    width: 100%;
  }
  </style>