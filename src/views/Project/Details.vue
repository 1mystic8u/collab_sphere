<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { auth, db } from '../../firebase'; // Assuming firebase config is here
import { doc, getDoc, updateDoc, arrayUnion, deleteDoc, Timestamp } from 'firebase/firestore';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Chip from 'primevue/chip';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';


// ai pane component 
import AiAssistant from '../AiAssistant.vue';

const router = useRouter();
const route = useRoute();
const project = ref(null);
const loading = ref(true);
const isLoggedIn = ref(false);
const currentUser = ref(null); 
const newDiscussion = ref('');
const commentLoading = ref(false);
const interestLoading = ref(false);



const showEditDialog = ref(false);
const editLoading = ref(false);
const editFormData = reactive({ 
    title: '',
    description: '',
    skills: '', 
});

const deleteLoading = ref(false);


onMounted(async () => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    isLoggedIn.value = !!user;
    currentUser.value = user; 
  
    if (project.value) {
     
    }
  });

  await fetchProjectDetails();

  
});

// --- UPDATE ---

const openEditDialog = () => {
  if (!project.value) return;
 
  editFormData.title = project.value.title;
  editFormData.description = project.value.description;
 
  editFormData.skills = computedSkills.value.join(', ');
  showEditDialog.value = true;
};

const saveProjectChanges = async () => {
  if (!project.value || !editFormData.title || !editFormData.description) {
      console.error("Title and Description are required.");
    
      return;
  }

  editLoading.value = true;
  try {
    const projectRef = doc(db, 'projects', project.value.id);
    const updatedData = {
      title: editFormData.title.trim(),
      description: editFormData.description.trim(),
    
      skills: editFormData.skills.split(',').map(s => s.trim()).filter(Boolean),
   
    };

    await updateDoc(projectRef, updatedData);

   
    project.value = {
        ...project.value,
        ...updatedData, 
       
    };

    showEditDialog.value = false; 
    console.log('Project updated successfully!');
    

  } catch (error) {
    console.error('Error updating project:', error);
    
  } finally {
    editLoading.value = false;
  }
};

//delete ops

const confirmDeleteProject = () => {
    if (!project.value) return;

  
    if (window.confirm(`Are you sure you want to delete the project "${project.value.title}"? This action cannot be undone.`)) {
        deleteProject();
    }

    
};


const deleteProject = async () => {
  if (!project.value) return;

  deleteLoading.value = true;
  try {
    const projectRef = doc(db, 'projects', project.value.id);
    await deleteDoc(projectRef);

    console.log('Project deleted successfully!');
   
  
    router.push('/dashboard');

  } catch (error) {
    console.error('Error deleting project:', error);
   
    deleteLoading.value = false; 
  }
 
};

const fetchProjectDetails = async () => {
  loading.value = true;
  try {
    const projectId = route.params.id;
    if (!projectId) {
        throw new Error("Project ID is missing from route parameters.");
    }
    const projectDocRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectDocRef);

    if (projectDoc.exists()) {
      const projectData = projectDoc.data();

      if (projectData.createdAt && projectData.createdAt.toDate) {
        projectData.createdAt = projectData.createdAt.toDate();
      } else {
        projectData.createdAt = new Date(); 
      }

      if (projectData.discussions && Array.isArray(projectData.discussions)) {
        projectData.discussions = projectData.discussions.map(discussion => {
          let createdAtDate = new Date(); 
          if (discussion.createdAt && discussion.createdAt.toDate) {
             createdAtDate = discussion.createdAt.toDate();
          } else if (discussion.createdAt instanceof Date) {
             createdAtDate = discussion.createdAt; 
          }
          const user = discussion.user || { displayName: 'Unknown User', uid: null };
          return {
            ...discussion,
            createdAt: createdAtDate,
            user: user
          };
        }).sort((a, b) => a.createdAt - b.createdAt); 
      } else {
        projectData.discussions = []; 
      }

      projectData.interested = projectData.interested || [];
      projectData.createdBy = projectData.createdBy || { displayName: 'Unknown Creator', uid: null, email: 'N/A' };


      project.value = {
        id: projectDoc.id,
        ...projectData
      };
    } else {
      console.warn(`Project with ID ${projectId} not found.`);
      project.value = null;
    }
  } catch (error) {
    console.error('Error fetching project details:', error);
    project.value = null; 
  } finally {
    loading.value = false;
  }
};

// owner of projct
const isCreator = computed(() => {
  if (!project.value || !currentUser.value) return false;
  return project.value.createdBy?.uid === currentUser.value?.uid;
});

//interest check
const hasExpressedInterest = computed(() => {
  if (!project.value || !currentUser.value) return false;
  
  return project.value.interested?.some(user => user.uid === currentUser.value?.uid);
});

const computedSkills = computed(() => {
  if (!project.value || !project.value.skills) return [];
  
    return project.value.skills ;
  
  if (typeof project.value.skills === 'string') {
     return project.value.skills.split(',').map(sk => sk.trim()).filter(Boolean);
  }

  if (Array.isArray(project.value.skills) && project.value.skills.every(s => typeof s === 'string')) {
    
      return project.value.skills.filter(Boolean);
  }
  return []; 
});


const expressInterest = async () => {
  if (!isLoggedIn.value || !currentUser.value) {
    router.push('/login'); 
    return;
  }
  if (!project.value) return; 

  interestLoading.value = true;
  try {
    const user = currentUser.value; 
    const projectRef = doc(db, 'projects', project.value.id);

    const interestData = {
      uid: user.uid,
      displayName: user.displayName || user.email || 'Anonymous', 
      email: user.email || 'No Email Provided',
      photoURL: user.photoURL || null 
    };

    await updateDoc(projectRef, {
      interested: arrayUnion(interestData)
    });

    if (project.value.interested) {
        project.value.interested.push(interestData);
    } else {
        project.value.interested = [interestData];
    }


  } catch (error) {
    console.error('Error expressing interest:', error);
  } finally {
    interestLoading.value = false;
  }
};

const addDiscussion = async () => {
  if (!isLoggedIn.value || !currentUser.value || !newDiscussion.value.trim()) return;
  if (!project.value) return;

  commentLoading.value = true;
  try {
    const user = currentUser.value;
    const projectRef = doc(db, 'projects', project.value.id);

    const discussionData = {
      content: newDiscussion.value,
      createdAt: Timestamp.now(), 
      user: {
        uid: user.uid,
        displayName: user.displayName || user.email || 'Anonymous',
        email: user.email || 'No Email Provided', 
        photoURL: user.photoURL || null
      }
    };

    await updateDoc(projectRef, {
      discussions: arrayUnion(discussionData)
    });

    const discussionDataForLocalState = {
        ...discussionData,
        createdAt: discussionData.createdAt.toDate()
    };

    if (project.value.discussions) {
       project.value.discussions.push(discussionDataForLocalState);
    } else {
       project.value.discussions = [discussionDataForLocalState];
    }

    newDiscussion.value = ''; 

  } catch (error) {
    console.error('Error adding discussion:', error);
  } finally {
    commentLoading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return 'Date not available';
  const jsDate = date instanceof Date ? date : (date && date.toDate ? date.toDate() : null);

  if (!jsDate) return 'Invalid Date';

  try {
      return jsDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
  } catch (e) {
      console.error("Error formatting date:", e, "Input date:", date);
      return 'Invalid Date';
  }
};

</script>

<template>
  <div class="outer_enclose">
    <div class="page-container">
     
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Loading project details...</p>
      </div>

    
      <div v-else-if="!project" class="error-state">
        <p>Project not found or could not be loaded.</p>
        <Button label="Back to Discover" @click="router.push('/discover')" />
      </div>

     
      <template v-else>
       
        <div class="back-button-container">
          <Button
            label="< Back to Home"
            style="background-color: aliceblue;"
            @click="router.push('/home')" />
          
        </div>

      
        <div class="project-details-header">
            <h2>Project Details</h2>
            <p class="creator-info">Created by: {{ project.createdBy.email || project.createdBy.displayName }}</p>
        </div>

       <br>
        <div class="interest-button-container">
            <Button
              v-if="isLoggedIn && !isCreator && !hasExpressedInterest"
              label="I'm Interested"
              icon="pi pi-heart"
              class="p-button-raised p-button-info interest-button"
              @click="expressInterest"
              :loading="interestLoading"
            />

            <Button
              v-else-if="isLoggedIn && !isCreator && hasExpressedInterest"
              label="Interested"
              icon="pi pi-check"
              class="p-button-raised p-button-success interest-button"
              disabled
            />
          
             <Button
              v-else-if="isLoggedIn && isCreator"
              label="My Project"
              icon="pi pi-user"
              class="p-button-raised p-button-secondary interest-button"
              disabled
            />

             <div v-if="isLoggedIn && isCreator" class="creator-actions">
                <Button
                    label="Edit Project"
                    icon="pi pi-pencil"
                    class="p-button-secondary p-button-sm action-button"
                    @click="openEditDialog"
                />
                <Button
                    label="Delete Project"
                    icon="pi pi-trash"
                    class="p-button-danger p-button-sm action-button"
                    @click="confirmDeleteProject"
                    :loading="deleteLoading"
                />
             </div>
        </div>


        <p class="project-description">
            {{ project.description }}
        </p>

        <div class="skills-section">
            <h3>Required Skills</h3>
            <div class="skills-container">
            <Chip v-for="skill in computedSkills" :key="skill" :label="skill" class="skill-chip" />
            <span v-if="computedSkills.length === 0">No specific skills listed.</span>
            </div>
        </div>

        <div class="interested-summary p-card p-component">
             <i class="pi pi-users icon"></i>
             <div class="summary-text">
                <span class="summary-title">Interested Students</span>
                <p class="summary-count">{{ project.interested?.length || 0 }} students are interested</p>
             </div>
        </div>

        <div class="interested-list" v-if="project.interested && project.interested.length > 0">
            <div v-for="user in project.interested" :key="user.uid" class="interested-user-item">
                <Avatar :image="user.photoURL" icon="pi pi-user" shape="circle" size="large" />
                <div class="user-info">
                    <div class="user-name">{{ user.displayName }}</div>
                    <div class="user-email">{{ user.email }}</div>
                </div>
            </div>
        </div>
         <div v-else class="interested-list-empty">
             <p>Be the first to show interest!</p>
         </div>

        <div class="discussion-section p-card p-component">
            <div class="discussion-header">
                <i class="pi pi-comments icon"></i>
                <h3 class="discussion-title">Discussion</h3>
            </div>

            <div v-if="project.discussions && project.discussions.length > 0" class="discussions-list">
                <div v-for="(discussion, index) in project.discussions" :key="index" class="discussion-item">
                    <div class="discussion-item-header">
                        <Avatar :image="discussion.user?.photoURL" icon="pi pi-user" shape="circle" size="normal" />
                        <div class="discussion-user-details">
                            <span class="discussion-user-name">{{ discussion.user?.displayName || 'Unknown User' }}</span>
                            <span class="discussion-time">{{ formatDate(discussion.createdAt) }}</span>
                        </div>
                    </div>
                    <p class="discussion-content">{{ discussion.content }}</p>
                </div>
            </div>
            <div v-else class="no-discussions">
                <p>No discussions yet. Start the conversation!</p>
            </div>

            <div v-if="isLoggedIn" class="add-discussion-area">
                <Textarea
                    v-model="newDiscussion"
                    rows="3"
                    placeholder="Add a comment..."
                    class="w-full comment-textarea"
                    autoResize
                />
                 <Button
                    label="Post Comment"
                    icon="pi pi-send"
                    class="p-button-sm post-comment-button"
                    @click="addDiscussion"
                    :disabled="!newDiscussion.trim()"
                    :loading="commentLoading"
                 />
            </div>
            <div v-else class="login-prompt">
                 <p>Please <router-link to="/login">login</router-link> or <router-link to="/register">sign up</router-link> to join the discussion.</p>
            </div>
        </div>

        
      </template>


      <Dialog
        v-model:visible="showEditDialog"
        modal
        header="Edit Project Details"
        :style="{ width: '50vw' }"
        :breakpoints="{'960px': '75vw', '640px': '90vw'}"
        @hide="() => editLoading = false" > <!-- Reset loading state if dialog is closed manually -->

        <div class="p-fluid formgrid grid">
            <div class="field col-12">
                <label for="editTitle">Project Title</label>
                <InputText id="editTitle" v-model="editFormData.title" />
            </div>
            <div class="field col-12">
                <label for="editDescription">Description</label>
                <Textarea id="editDescription" v-model="editFormData.description" rows="5" autoResize />
            </div>
            <div class="field col-12">
                <label for="editSkills">Required Skills (comma-separated)</label>
                <InputText id="editSkills" v-model="editFormData.skills" />
                 <small>e.g., Vue, Firebase, JavaScript, CSS</small>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" />
            <Button label="Save Changes" icon="pi pi-check" @click="saveProjectChanges" :loading="editLoading" />
        </template>
      </Dialog>

     

    </div>


    <div class="ai_pane">     
     <AiAssistant :project="project" v-if="isLoggedIn" />
    </div>
  </div>

    

</template>

<style scoped>

.action-buttons-container {
    margin-top: -60px; 
    display: flex;
    justify-content: flex-end; 
    margin-bottom: 1rem; 
    gap: 0.5rem; 
    height: 40px; 
    align-items: center;
}

.creator-actions {
    display: flex;
    gap: 0.5rem; 
}



.interest-button {
    min-width: 150px; 
    margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
    .action-buttons-container {
        margin-top: 1rem; 
        justify-content: flex-start; 
        margin-bottom: 1rem;
    }
}

.p-dialog .field {
    margin-bottom: 1rem;
}
.p-dialog .field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}
.p-dialog .field small {
    display: block;
    margin-top: 0.25rem;
    color: #6c757d;
}

.project-details-header h2 {
    margin-bottom: 0.25rem;
    font-size: 1.8rem;
    font-weight: bold;
    word-break: break-word; 
}

.outer_enclose {
  display: grid;
  grid-template-columns: 4fr 1fr; 
 
}

.ai_pane{
  max-width: 25wv;
}

.page-container {
  max-width: 900px;
  margin: 1rem ;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; 
}


.loading-state, .error-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.back-button-container {
    margin-bottom: 0.5rem;
}

.back-button.p-button-text {
    padding: 0.25rem 0.5rem;
    color: #056d5b; 
    font-weight: normal;
}
.back-button .pi {
    margin-right: 0.25rem;
}

.project-details-header {
    margin-bottom: 0.5rem;
}

.project-details-header h2 {
    margin-bottom: 0.25rem;
    font-size: 1.8rem; 
    font-weight: bold;
}

.creator-info {
    color: #6b7280; 
    font-size: 0.9rem;
    margin-bottom: 1rem; 
}

.interest-button-container {
    margin-top: -60px; 
    justify-content: flex-end; 
    margin-bottom: 1rem; 
}

.interest-button {
    min-width: 150px; 
}


.project-description {
  line-height: 1.6;
  margin-bottom: 1.5rem; 
  color: #333;
}

.skills-section h3,
.discussion-section h3 {
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.skill-chip {
  background-color: #e9ecef;
  color: #495057;
  font-size: 0.85rem;
}

.interested-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: #e0f7fa; 
    border: 1px solid #b2ebf2;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem; 
}

.interested-summary .icon {
    font-size: 2rem;
    color: #0097a7; 
}
.interested-summary .summary-text {
    flex-grow: 1;
}
.interested-summary .summary-title {
    font-weight: bold;
    font-size: 1.1rem;
    display: block; 
    margin-bottom: 0.25rem;
}
.interested-summary .summary-count {
    color: #555;
    margin: 0; 
    font-size: 0.9rem;
}


.interested-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr); 
    gap: 1.5rem;
    margin-bottom: 1.5rem; 
}

.interested-list-empty {
    color: #6c757d;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 6px;
    text-align: center;
}

.interested-user-item {
    display: flex;
    align-items: center;
    gap: 0.75rem; 
    background-color: #fff; 
    padding: 0.75rem; 
    border-radius: 6px; 
    box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
}

.interested-user-item .user-info {
    display: flex;
    flex-direction: column;
}

.interested-user-item .user-name {
    font-weight: 600;
    font-size: 0.95rem;
}

.interested-user-item .user-email {
    font-size: 0.85rem;
    color: #6c757d; 
    word-break: break-all;
}

/* Discussion Section Card */
.discussion-section {
    background-color: #e0f7fa; 
    border: 1px solid #b2ebf2;
    border-radius: 8px;
    padding: 1.5rem;
}

.discussion-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}
.discussion-header .icon {
    font-size: 1.8rem;
    color: #0097a7;
}
.discussion-header .discussion-title {
    margin: 0;
     font-size: 1.2rem;
     font-weight: 600;
}

.discussions-list {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem; 
}

.no-discussions, .login-prompt {
    color: #6c757d;
    padding: 1rem 0;
    text-align: center;
}
.login-prompt a {
    color: #007bff;
    text-decoration: none;
}
.login-prompt a:hover {
    text-decoration: underline;
}


.discussion-item {
    background-color: #fff; 
    padding: 1rem;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.discussion-item-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}
.discussion-user-details {
    display: flex;
    flex-direction: column;
}
.discussion-user-name {
    font-weight: 600;
    font-size: 0.9rem;
}
.discussion-time {
    font-size: 0.8rem;
    color: #6c757d;
}

.discussion-content {
    margin: 0.5rem 0 0 0;
    font-size: 0.95rem;
    line-height: 1.5;
    color: #333;
     white-space: pre-wrap; 
     word-wrap: break-word;
}


.add-discussion-area {
    display: flex;
    flex-direction: column; 
    gap: 0.5rem; 
    margin-top: 1rem;
    border-top: 1px solid #dee2e6; 
    padding-top: 1rem;
}

.comment-textarea {
    font-size: 0.95rem;
    border-radius: 6px;
}
.comment-textarea::placeholder {
  color: #999;
}

.post-comment-button {
    align-self: flex-end; 
}

:deep(.p-card .p-card-content) {
    padding: 0; 
}
:deep(.p-card .p-card-body) {
    padding: 1rem; 
}

@media (max-width: 768px) {
    .interested-list {
        grid-template-columns: repeat(2, 1fr); 
    }
    .interest-button-container {
        margin-top: 1rem; 
        justify-content: flex-start;
        margin-bottom: 1rem;
    }
}
@media (max-width: 576px) {
     .interested-list {
        grid-template-columns: 1fr; 
    }
    .project-details-header h2 {
        font-size: 1.5rem;
    }
}


</style>