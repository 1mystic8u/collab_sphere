<script>
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';

</script>


<template>
    <div class="project-details-container">
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Loading project details...</p>
      </div>
      
      <div v-else-if="!project" class="error-state">
        <p>Project not found or has been removed.</p>
        <Button label="Back to Discover" @click="router.push('/discover')" />
      </div>
      
      <template v-else>
        <div class="back-link">
          <Button 
            icon="pi pi-arrow-left" 
            label="Back to Projects" 
            class="p-button-text" 
            @click="router.push('/discover')" 
          />
        </div>
        
        <div class="project-header">
          <div>
            <h1>{{ project.title }}</h1>
            <div class="project-meta">
              <span>Created by: {{ project.createdBy.displayName }}</span>
              <span class="separator">•</span>
              <span>{{ formatDate(project.createdAt) }}</span>
            </div>
          </div>
          
          <Button 
            v-if="isLoggedIn && !isCreator && !hasExpressedInterest"
            label="I'm Interested" 
            icon="pi pi-heart" 
            @click="expressInterest"
            :loading="interestLoading"
          />
          <Button 
            v-else-if="isLoggedIn && !isCreator && hasExpressedInterest"
            label="Interested" 
            icon="pi pi-check" 
            class="p-button-success" 
            disabled
          />
        </div>
        
        <div class="project-content">
          <div class="project-details">
            <Card>
              <template #content>
                <h3>Project Description</h3>
                <p class="description">{{ project.description }}</p>
                
                <div class="skills-section">
                  <h3>Required Skills</h3>
                  <div class="skills-container">
                    <Chip v-for="skill in project.skills" :key="skill" :label="skill" class="skill-chip" />
                  </div>
                </div>
                
                <div class="interested-section">
                  <h3>Interested Contributors ({{ project.interested.length }})</h3>
                  <div v-if="project.interested.length === 0" class="no-interested">
                    <p>No one has expressed interest yet. Be the first!</p>
                  </div>
                  <div v-else class="interested-users">
                    <!-- In a real app, you'd fetch user details for each interested user -->
                    <div v-for="(user, index) in project.interested" :key="index" class="interested-user">
                      <Avatar icon="pi pi-user" shape="circle" />
                      <span>{{ user.displayName }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
          
          <div class="project-discussions">
            <Card>
              <template #header>
                <div class="card-header">
                  <h3>Discussion</h3>
                </div>
              </template>
              <template #content>
                <div v-if="project.discussions.length === 0" class="no-discussions">
                  <p>No discussions yet. Start the conversation!</p>
                </div>
                
                <div v-else class="discussions-list">
                  <div v-for="(discussion, index) in project.discussions" :key="index" class="discussion-item">
                    <div class="discussion-header">
                      <div class="user-info">
                        <Avatar icon="pi pi-user" shape="circle" />
                        <span class="user-name">{{ discussion.user.displayName }}</span>
                      </div>
                      <span class="discussion-time">{{ formatDate(discussion.createdAt) }}</span>
                    </div>
                    <p class="discussion-content">{{ discussion.content }}</p>
                  </div>
                </div>
                
                <div v-if="isLoggedIn" class="add-discussion">
                  <form @submit.prevent="addDiscussion">
                    <Textarea 
                      v-model="newDiscussion" 
                      rows="3" 
                      placeholder="Add to the discussion..." 
                      class="w-full"
                    />
                    <Button 
                      type="submit" 
                      label="Post Comment" 
                      icon="pi pi-send" 
                      :disabled="!newDiscussion.trim()" 
                      :loading="commentLoading"
                    />
                  </form>
                </div>
                
                <div v-else class="login-prompt">
                  <p>Please <router-link to="/login">login</router-link> to join the discussion.</p>
                </div>
              </template>
            </Card>
          </div>
        </div>
      </template>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { auth, db } from '../../firebase';
  import { doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
  
  const router = useRouter();
  const route = useRoute();
  const project = ref(null);
  const loading = ref(true);
  const isLoggedIn = ref(false);
  const newDiscussion = ref('');
  const commentLoading = ref(false);
  const interestLoading = ref(false);
  
  onMounted(async () => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      isLoggedIn.value = !!user;
    });
    
    await fetchProjectDetails();
    
    return () => unsubscribe();
  });
  
  const fetchProjectDetails = async () => {
    loading.value = true;
    
    try {
      const projectId = route.params.id;
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        // Convert Firestore Timestamp to JavaScript Date
        if (projectData.createdAt && projectData.createdAt.toDate) {
          projectData.createdAt = projectData.createdAt.toDate();
        }
        
        // Convert timestamps in discussions
        if (projectData.discussions) {
          projectData.discussions = projectData.discussions.map(discussion => {
            if (discussion.createdAt && discussion.createdAt.toDate) {
              return {
                ...discussion,
                createdAt: discussion.createdAt.toDate()
              };
            }
            return discussion;
          });
        }
        
        project.value = {
          id: projectDoc.id,
          ...projectData
        };
      } else {
        project.value = null;
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      project.value = null;
    } finally {
      loading.value = false;
    }
  };
  
  const isCreator = computed(() => {
    if (!project.value || !isLoggedIn.value) return false;
    return project.value.createdBy.uid === auth.currentUser?.uid;
  });
  
  const hasExpressedInterest = computed(() => {
    if (!project.value || !isLoggedIn.value) return false;
    return project.value.interested.some(user => user.uid === auth.currentUser?.uid);
  });
  
  const expressInterest = async () => {
    if (!isLoggedIn.value) {
      router.push('/login');
      return;
    }
    
    interestLoading.value = true;
    
    try {
      const currentUser = auth.currentUser;
      const projectRef = doc(db, 'projects', project.value.id);
      
      // Add user to project's interested array
      await updateDoc(projectRef, {
        interested: arrayUnion({
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Anonymous'
        })
      });
      
      // Update user's interestedProjects in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        interestedProjects: arrayUnion(project.value.id)
      });
      
      // Update local state
      project.value.interested.push({
        uid: currentUser.uid,
        displayName: currentUser.displayName || 'Anonymous'
      });
    } catch (error) {
      console.error('Error expressing interest:', error);
    } finally {
      interestLoading.value = false;
    }
  };
  
  const addDiscussion = async () => {
    if (!isLoggedIn.value || !newDiscussion.value.trim()) return;
    
    commentLoading.value = true;
    
    try {
      const currentUser = auth.currentUser;
      const projectRef = doc(db, 'projects', project.value.id);
      
      const discussion = {
        content: newDiscussion.value,
        createdAt: new Date(),
        user: {
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'Anonymous'
        }
      };
      
      // Add discussion to project
      await updateDoc(projectRef, {
        discussions: arrayUnion({
          ...discussion,
          createdAt: Timestamp.fromDate(discussion.createdAt)
        })
      });
      
      // Update local state
      project.value.discussions.push(discussion);
      newDiscussion.value = '';
    } catch (error) {
      console.error('Error adding discussion:', error);
    } finally {
      commentLoading.value = false;
    }
  };
  
  const formatDate = (date) => {
    if (!date) return '';
    
    // Convert Firestore Timestamp to JS Date if needed
    const jsDate = date instanceof Date ? date : date.toDate();
    
    return jsDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  </script>
  
  <style scoped>
  .project-details-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .back-link {
    margin-bottom: 1rem;
  }
  
  .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }
  
  .project-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }
  
  .separator {
    font-size: 0.8rem;
  }
  
  .project-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .description {
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  .skills-section {
    margin-bottom: 2rem;
  }
  .skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  </style>